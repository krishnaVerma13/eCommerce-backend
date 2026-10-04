import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
         type: String, 
         required: true, 
         trim: true
        },
    email: { 
        type: String, 
        unique: true, 
        sparse: true, 
        lowercase: true, 
        trim: true 
        },
    phone: { 
        type: String || Number, 
        unique: true, 
        sparse: true, 
        trim: true 
        },
    password: { 
        type: String, 
        required: true
        },
  },
  { timestamps: true }
);

// // Require at least one contact method
// userSchema.pre('validate', function (next) {
//   if (!this.email && !this.phone) {
//     return next(new Error('Either email or phone is required'));
//   }
//   next();
// });

export default mongoose.model('User', userSchema);