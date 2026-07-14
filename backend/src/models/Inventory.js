import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ['food', 'medicine', 'clothing', 'furniture', 'education', 'hygiene', 'other'],
      default: 'food',
    },
    currentStock: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    minimumStock: { type: Number, default: 10 },
    neededQuantity: { type: Number, default: 0 },
    expiryDate: Date,
    lastRestocked: Date,
    isLowStock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.pre('save', function (next) {
  this.isLowStock = this.currentStock <= this.minimumStock;
  next();
});

export default mongoose.model('Inventory', inventorySchema);
