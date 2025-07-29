import mongoose from "mongoose";
const { Schema } = mongoose;

const BranchSchema = new Schema({
  branch_name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { 
  timestamps: true 
});

const BranchModel = mongoose.model('branch', BranchSchema);

export default BranchModel;