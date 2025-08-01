import mongoose from "mongoose";

const { Schema } = mongoose;

const LeaveSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  leaveType: { type: String, enum: ['sick', 'vacation', 'personal', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
  approvedAt: { type: Date, default: null }
}, {
  timestamps: true
});

const LeaveModel = mongoose.model('leave', LeaveSchema);

export default LeaveModel;