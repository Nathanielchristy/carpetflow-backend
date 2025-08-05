import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  carpet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  movementType: {
    type: String,
    enum: ['in', 'out', 'adjustment'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['invoice', 'purchase', 'return', 'adjustment'],
  },
  referenceId: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: true,
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

// Add a toJSON transform to rename _id to id
stockMovementSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
