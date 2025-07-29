import mongoose from 'mongoose';

const EmployeeRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true
  },
  items: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  managerApproval: {
    approved: Boolean,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    approvedAt: Date,
    notes: String
  },
  fulfillment: {
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    fulfilledAt: Date
  }
}, { timestamps: true });

export default mongoose.model('EmployeeRequest', EmployeeRequestSchema);