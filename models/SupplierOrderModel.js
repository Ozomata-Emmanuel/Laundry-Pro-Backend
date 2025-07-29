import mongoose from 'mongoose';

const { Schema } = mongoose;

const SupplierOrderSchema = new Schema({
  supplier: { 
    type: Schema.Types.ObjectId, 
    ref: 'supplier',
    required: true 
  },
  items: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'fulfilled', 'partially_fulfilled'],
    default: 'pending'
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  expectedDeliveryDate: Date,
  notes: String
}, { timestamps: true });

const SupplierOrderModel = mongoose.model('request', SupplierOrderSchema);

export default SupplierOrderModel;