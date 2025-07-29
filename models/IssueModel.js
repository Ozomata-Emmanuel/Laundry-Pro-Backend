import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
  order_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'order', 
    required: [true, 'Order reference is required'] 
  },
  branch_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'branch', 
    required: [true, 'Branch reference is required'] 
  },
  reported_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: [true, 'Reporter reference is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved'], 
    default: 'open' 
  },
  resolved_at: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

IssueSchema.virtual('order', {
  ref: 'order',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

IssueSchema.virtual('branch', {
  ref: 'branch',
  localField: 'branch_id',
  foreignField: '_id',
  justOne: true
});

IssueSchema.virtual('reporter', {
  ref: 'user',
  localField: 'reported_by',
  foreignField: '_id',
  justOne: true
});

const IssueModel = mongoose.model('issue', IssueSchema);

export default IssueModel;