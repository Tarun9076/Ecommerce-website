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
    
    // Hash the password directly
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password using updateOne to bypass the pre-save hook
    await User.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password updated using updateOne');
    
    // Test the new password
    const updatedAdmin = await User.findById(admin._id);
    const isMatch = await updatedAdmin.comparePassword(newPassword);
    console.log('Password match test:', isMatch);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });