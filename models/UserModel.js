import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const UserSchema = new Schema({
  first_name: { type: String, required: [true, 'First name is required'] },
  last_name: { type: String, required: [true, 'Last name is required'] },
  email: { type: String, unique: true, required: [true, 'Email address is required'] },
  phone: { type: String, required: [true, 'Phone number is required'] },
  password: { type: String, required: [true, 'Password is required'] },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, "Invalid branch"] },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'employee', 'customer', 'supplier'], 
    required: true, 
    default: "customer" 
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;