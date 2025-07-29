import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const SupplierSchema = new Schema({
  companyName: { type: String, required: [true, 'Company name is required'] },
  contactPerson: { type: String, required: [true, 'Contact person is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  phone: { type: String, required: [true, 'Phone is required'] },
  password: { type: String, required: [true, 'Password is required'] },
  suppliedItems: { type: [String], required: true, enum: ['detergent', 'fabric_softener', 'bleach', 'hangers', 'packaging'] },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] }
}, { timestamps: true });

SupplierSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

SupplierSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

SupplierSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { id: this._id, role: 'supplier' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
};

const SupplierModel = mongoose.model('supplier', SupplierSchema);

export default SupplierModel;