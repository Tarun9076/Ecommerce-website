const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('MongoDB connected');
    
    // Find admin user
    const admin = await User.findOne({ email: 'tarunkumr81@gmail.com' });
    if (!admin) {
      console.log('Admin user not found');
      return process.exit(1);
    }
    
    console.log('Admin found:', admin.email);
    console.log('Admin password hash:', admin.password);
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await admin.comparePassword(testPassword);
    console.log('Password match for "admin123":', isMatch);
    
    // If it doesn't match, let's update it manually
    if (!isMatch) {
      console.log('Updating password manually...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('Password updated successfully');
      
      // Test again
      const isMatchAfterUpdate = await admin.comparePassword(testPassword);
      console.log('Password match after update:', isMatchAfterUpdate);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });