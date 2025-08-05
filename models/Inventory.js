import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  material: {
    type: String,
    trim: true,
  },
  rollLength: {
    type: Number,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
  },
  minimumStock: {
    type: Number,
    default: 0,
  },
  maximumStock: {
    type: Number,
    default: 0,
  },
  barcode: {
    type: String,
    unique: true,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  supplier: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

inventorySchema.index({ '$**': 'text' });

// Add a toJSON transform to rename _id to id
inventorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
