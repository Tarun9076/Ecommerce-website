const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals
cartSchema.methods.calculateTotals = async function() {
  let totalItems = 0;
  let totalPrice = 0;
  
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    if (product) {
      totalItems += item.quantity;
      // Calculate discounted price
      const itemPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100)
        : product.price;
      totalPrice += itemPrice * item.quantity;
    }
  }
  
  this.totalItems = totalItems;
  this.totalPrice = totalPrice;
  this.lastUpdated = new Date();
};

// Add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
  
  await this.calculateTotals();
  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  await this.calculateTotals();
  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    } else {
      item.quantity = quantity;
      await this.calculateTotals();
      return this.save();
    }
  }
  
  return this;
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
  this.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
