const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectID},
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
