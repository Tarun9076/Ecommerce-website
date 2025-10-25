const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB connected');
    
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    
    console.log(`Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Image: ${JSON.stringify(product.image)}`);
      console.log(`   Images: ${product.images ? product.images.length : 0} images`);
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, i) => {
          console.log(`     - ${i + 1}: ${JSON.stringify(img)}`);
        });
      }
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB();