const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for checkout
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, payment_method_types = ['card'] } = req.body;
    const currency = 'inr'; // Set currency to INR for Indian Rupees

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise (1 INR = 100 paise)
      currency,
      payment_method_types,
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// @route   GET /api/payments/config
// @desc    Get Stripe publishable key
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Helper function to handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      console.error('Cart not found for user:', userId);
      return;
    }
    
    // Create order from cart
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: paymentIntent.amount / 100, // Convert from paise to INR
      shippingAddress: cart.shippingAddress,
      paymentId: paymentIntent.id,
      status: 'paid',
      currency: 'INR'
    });
    
    await order.save();
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    console.log('Payment successful, order created:', order._id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Helper function to handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    // You could create a failed order record or notify the user
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router;