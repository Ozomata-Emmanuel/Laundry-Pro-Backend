import mongoose from 'mongoose';

const { Schema } = mongoose;

const InventorySchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'],
    unique: true,
    trim: true
  },
  category: { 
    type: String, 
    required: [true, 'Please add a category'],
    enum: ['Cleaning', 'Packaging', 'Personal Care', 'Linens', 'Other']
  },
  currentStock: { 
    type: Number, 
    required: [true, 'Please add current stock'],
    min: 0
  },
  reorderLevel: { 
    type: Number, 
    required: [true, 'Please add reorder level'],
    min: 1
  },
  unit: { 
    type: String, 
    required: [true, 'Please add a unit'],
    enum: ['liters', 'pieces', 'kg', 'boxes', 'units']
  },
  supplier: { 
    type: Schema.Types.ObjectId, 
    ref: 'supplier' 
  },
  lastRestocked: { 
    type: Date,
    default: Date.now
  },
  status: { 
    type: String, 
    enum: ['Critical', 'Low', 'Adequate', 'High'],
    default: 'Adequate'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InventorySchema.pre('save', function(next) {
  if (this.currentStock <= 0) {
    this.status = 'Critical';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'Low';
  } else if (this.currentStock > this.reorderLevel * 2) {
    this.status = 'High';
  } else {
    this.status = 'Adequate';
  }
  next();
});

const InventoryModel = mongoose.model('Inventory', InventorySchema);

export default InventoryModel;