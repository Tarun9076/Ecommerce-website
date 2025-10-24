const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('MongoDB connected');
    
    // Find all users
    const users = await User.find({});
    console.log('All users:', users.map(u => ({ email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName })));
    
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    console.log('Admin users:', admins.map(a => ({ email: a.email, firstName: a.firstName, lastName: a.lastName })));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });