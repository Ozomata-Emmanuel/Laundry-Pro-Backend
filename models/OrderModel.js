import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: [true, 'Branch reference is required'] },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User reference is required'] },
  assigned_employee_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  items: [{
    service_id: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true }
  }],
  total_price: { type: Number, required: true },
  payment_type: { type: String, enum: ['card', 'paypal', 'cash'], required: true },
  is_paid: { type: Boolean, default: false },
  stripe_payment_id: { type: String },
  delivery_option: { type: String, enum: ['pickup', 'dropoff'], required: true },
  pickup_date: { type: Date },
  pickup_time: { type: String },
  delivery_date: { type: Date },
  delivery_time: { type: String },
  address: { type: String },
  is_delivered: { type: Boolean, default: false },
  status: { type: String, enum: ['not_started', 'processing', 'finished'], default: 'not_started' },
  special_requests: { type: String },
  order_notes: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

OrderSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branch_id',
  foreignField: '_id',
  justOne: true
});

OrderSchema.virtual('user', {
  ref: 'user',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

OrderSchema.virtual('employee', {
  ref: 'employee',
  localField: 'assigned_employee_id',
  foreignField: '_id',
  justOne: true
});

const OrderModel = mongoose.model('order', OrderSchema);

export default OrderModel;