import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

import validateToken from '../middleware/validateTokenHandle.js';

const userRout = Router();
userRout.post('/register', registerUser)

userRout.post('/login', loginUser);


export default userRout;