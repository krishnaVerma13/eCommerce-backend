import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;

const parseContact = (contact) => {
  // console.log("cont :",contact);
  // console.log("cont :",typeof( contact));

  if (typeof contact !== 'string') return null;
  const trimmed = contact.trim();

  if (EMAIL_REGEX.test(trimmed)) {
    return { type: 'email', value: trimmed.toLowerCase() };
  }

  const cleaned = trimmed.replace(/[\s-]/g, '');
  // console.log(PHONE_REGEX.test(cleaned));
  if (PHONE_REGEX.test(cleaned)) {

    return { type: 'phone', value: cleaned.slice(-10) };
  }

  return null;
};

const generateToken = (user) =>
  jwt.sign(
    { user: { id: user.id, name: user.name } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );




export const registerUser = asyncHandler(async (req, res) => {
  const { name, contact, password } = req.body;
  console.log(name, contact);

  if (!name || !contact || !password) {
    return sendError(res, 400, 'Name, contact and password are required', {
      code: 'VALIDATION_ERROR',
    });
  }
  console.log("2");

  if (typeof name !== 'string' || name.trim().length < 2) {
    return sendError(res, 400, 'Name must be at least 2 characters', {
      code: 'VALIDATION_ERROR',
      field: 'name',
    });
  }
  console.log("3");

  const parsed = parseContact(contact);
  if (!parsed) {
    return sendError(res, 400, 'Enter a valid email or 10-digit phone number', {
      code: 'VALIDATION_ERROR',
      field: 'contact',
    });
  }
  console.log("4");

  if (typeof password !== 'string' || password.length < 8) {
    return sendError(res, 400, 'Password must be at least 8 characters', {
      code: 'VALIDATION_ERROR',
      field: 'password',
    });
  }
  console.log("5 :", parsed);

  const exists = await User.findOne({ [parsed.type]: parsed.value });
  if (exists) {
    return sendError(res, 409, 'User already registered', {
      code: 'USER_EXISTS',
      field: 'contact',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("6 :", parsed);

  try {
    await User.create({
      name: name,
      [parsed.type]: parsed.value,
      password: hashedPassword,
    });
    console.log("7");

    return sendSuccess(res, 201, 'Registration successful. Please log in.');
  } catch (err) {
    // Two requests registering the same contact at the same time
    if (err.code === 11000) {
      console.log(err.keyPattern, err.keyValue);
      return sendError(res, 409, 'User already registered', {
        code: 'USER_EXISTS',
        field: 'contact',
      });
    }
    throw err; // unexpected error, handled by errorHandler as a 500
  }
});





export const loginUser = asyncHandler(async (req, res) => {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return sendError(res, 400, 'Contact and password are required', {
      code: 'VALIDATION_ERROR',
    });
  }

  const parsed = parseContact(contact);
  if (!parsed || typeof password !== 'string') {
    return sendError(res, 400, 'Enter a valid email or 10-digit phone number', {
      code: 'VALIDATION_ERROR',
      field: 'contact',
    });
  }

  const user = await User.findOne({ [parsed.type]: parsed.value });

  // Same message for "no user" and "wrong password"
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return sendError(res, 401, 'Invalid credentials', {
      code: 'INVALID_CREDENTIALS',
    });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  };


  res.cookie('token', generateToken(user), cookieOptions);


  return sendSuccess(res, 200, 'Login successful', {
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});