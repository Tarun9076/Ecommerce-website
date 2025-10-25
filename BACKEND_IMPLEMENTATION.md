# Backend Implementation Guide

## Required Endpoints Implementation

### 1. Promo Code Validation Endpoint

**File:** `server/routes/promo.js` (Create new file)

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PromoCode = require('../models/PromoCode'); // Create this model

// Validate promo code
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, totalPrice } = req.body;

    if (!code || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Code and total price are required'
      });
    }

    // Find promo code
    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    if (!promo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check usage limits
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This promo code has reached its usage limit'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (totalPrice * promo.discountValue) / 100;
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, promo.maxDiscount);
      }
    } else if (promo.discountType === 'fixed') {
      discountAmount = promo.discountValue;
    }

    // Check minimum order value
    if (promo.minOrderValue && totalPrice < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${promo.minOrderValue} required`
      });
    }

    // Update usage count
    promo.usedCount += 1;
    await promo.save();

    res.status(200).json({
      success: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      promoCode: promo._id,
      message: 'Promo code applied successfully'
    });
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promo code'
    });
  }
});

module.exports = router;
```

**PromoCode Model:** `server/models/PromoCode.js`

```javascript
const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  maxDiscount: {
    type: Number, // For percentage discounts
    default: null
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number, // Total uses allowed globally
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);
```

---

### 2. Newsletter Subscription Endpoint

**File:** `server/routes/newsletter.js` (Create new file)

```javascript
const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed to newsletter'
      });
    }

    // Create new subscriber
    const subscriber = new Newsletter({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      isActive: true
    });

    await subscriber.save();

    // TODO: Send welcome email here
    // await sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: subscriber
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter'
    });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false, unsubscribedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in newsletter'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from newsletter'
    });
  }
});

module.exports = router;
```

**Newsletter Model:** `server/models/Newsletter.js`

```javascript
const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  tags: [String], // For segmentation
  preferences: {
    deals: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: true },
    tips: { type: Boolean, default: true }
  }
});

// Index for faster queries
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
```

---

### 3. Register Routes in Main Server File

**File:** `server/index.js`

Add these lines to your Express app setup:

```javascript
// Add these imports
const promoRoutes = require('./routes/promo');
const newsletterRoutes = require('./routes/newsletter');

// Add these routes (after your existing routes)
app.use('/api/promo', promoRoutes);
app.use('/api/newsletter', newsletterRoutes);
```

---

### 4. Optional: Admin Endpoints to Manage Promos

**File:** `server/routes/admin.js` (Add to existing file)

```javascript
// Create new promo code (Admin only)
router.post('/promos', isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minOrderValue, maxUses, expiryDate } = req.body;

    const promo = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      maxUses,
      expiryDate: new Date(expiryDate),
      isActive: true
    });

    await promo.save();

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating promo code'
    });
  }
});

// Get all promo codes (Admin only)
router.get('/promos', isAdmin, async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: promos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching promo codes'
    });
  }
});

// Update promo code (Admin only)
router.put('/promos/:id', isAdmin, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Promo code updated successfully',
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating promo code'
    });
  }
});

// Delete promo code (Admin only)
router.delete('/promos/:id', isAdmin, async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting promo code'
    });
  }
});

// Get newsletter subscribers (Admin only)
router.get('/newsletter/subscribers', isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
});
```

---

## Installation Steps

1. **Create new route files:**
   - `server/routes/promo.js`
   - `server/routes/newsletter.js`

2. **Create new model files:**
   - `server/models/PromoCode.js`
   - `server/models/Newsletter.js`

3. **Update `server/index.js`** with the new routes

4. **Install any additional packages if needed:**
   ```bash
   npm install nodemailer  # For email notifications (optional)
   ```

5. **Test the endpoints** using Postman or Thunder Client

---

## Database Seeding (Optional)

Create test data for promo codes:

```javascript
// server/seedPromos.js

const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');

mongoose.connect('mongodb://localhost:27017/ecommerce');

const seedPromos = async () => {
  try {
    await PromoCode.deleteMany({});

    const promos = [
      {
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 500,
        minOrderValue: 500,
        maxUses: 100,
        expiryDate: new Date('2024-12-31')
      },
      {
        code: 'FLAT100',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 1000,
        maxUses: 50,
        expiryDate: new Date('2024-12-31')
      },
      {
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 1000,
        minOrderValue: 0,
        maxUses: null,
        expiryDate: new Date('2024-12-31')
      }
    ];

    await PromoCode.insertMany(promos);
    console.log('Promo codes seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding promos:', error);
    process.exit(1);
  }
};

seedPromos();
```

Run with: `node server/seedPromos.js`

---

## Testing with cURL

```bash
# Test Promo Validation
curl -X POST http://localhost:5000/api/promo/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code":"SAVE10","totalPrice":1000}'

# Test Newsletter Subscription
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

**Status:** Ready for Implementation
**Priority:** High
**Estimated Time:** 2-3 hours