require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Apple iPhone 15 Pro',
    description: 'The latest iPhone with A17 Pro chip, stunning titanium design, and advanced camera system. Features Action button, USB-C, and all-day battery life.',
    price: 999,
    category: 'electronics',
    brand: 'Apple',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        alt: 'iPhone 15 Pro'
      }
    ],
    stock: 50,
    sku: 'IPHONE-15-PRO-256',
    tags: ['smartphone', 'apple', 'ios', 'mobile'],
    isActive: true,
    isFeatured: true,
    discount: 10
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android flagship with S Pen, incredible camera zoom, and powerful performance. Features AI-powered tools and long-lasting battery.',
    price: 1199,
    category: 'electronics',
    brand: 'Samsung',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
        alt: 'Samsung Galaxy S24 Ultra'
      }
    ],
    stock: 40,
    sku: 'SAMSUNG-S24-ULTRA-512',
    tags: ['smartphone', 'samsung', 'android', 'mobile'],
    isActive: true,
    isFeatured: true,
    discount: 5
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality. Features 30-hour battery life and multipoint connection.',
    price: 399,
    category: 'electronics',
    brand: 'Sony',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
        alt: 'Sony WH-1000XM5'
      }
    ],
    stock: 75,
    sku: 'SONY-WH1000XM5-BLK',
    tags: ['headphones', 'wireless', 'noise-canceling', 'audio'],
    isActive: true,
    isFeatured: true,
    discount: 15
  },
  {
    name: 'MacBook Pro 14" M3',
    description: 'Supercharged by M3 chip with incredible performance and battery life. Features stunning Liquid Retina XDR display and advanced connectivity.',
    price: 1999,
    category: 'electronics',
    brand: 'Apple',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        alt: 'MacBook Pro 14'
      }
    ],
    stock: 30,
    sku: 'MBP-14-M3-512',
    tags: ['laptop', 'macbook', 'apple', 'computer'],
    isActive: true,
    isFeatured: true,
    discount: 0
  },
  {
    name: 'Nike Air Max 270',
    description: 'Iconic sneakers with Max Air unit for unrivaled comfort and style. Perfect for everyday wear with breathable mesh upper.',
    price: 150,
    category: 'clothing',
    brand: 'Nike',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        alt: 'Nike Air Max 270'
      }
    ],
    stock: 100,
    sku: 'NIKE-AM270-BLK-10',
    tags: ['shoes', 'sneakers', 'nike', 'sportswear'],
    isActive: true,
    isFeatured: false,
    discount: 20
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'The original blue jean since 1873. Classic straight fit with button fly, made from premium denim for lasting quality.',
    price: 89,
    category: 'clothing',
    brand: 'Levi\'s',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542272454315-7f6fabf1b91c?w=500',
        alt: 'Levi\'s 501 Jeans'
      }
    ],
    stock: 150,
    sku: 'LEVIS-501-BLUE-32',
    tags: ['jeans', 'denim', 'pants', 'clothing'],
    isActive: true,
    isFeatured: false,
    discount: 0
  },
  {
    name: 'PlayStation 5 Console',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, and stunning games.',
    price: 499,
    category: 'electronics',
    brand: 'Sony',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
        alt: 'PlayStation 5'
      }
    ],
    stock: 25,
    sku: 'PS5-CONSOLE-STD',
    tags: ['gaming', 'console', 'playstation', 'entertainment'],
    isActive: true,
    isFeatured: true,
    discount: 0
  },
  {
    name: 'Kindle Paperwhite',
    description: 'Now with a 6.8" display and adjustable warm light. Waterproof design with weeks of battery life and access to millions of books.',
    price: 139,
    category: 'electronics',
    brand: 'Amazon',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=500',
        alt: 'Kindle Paperwhite'
      }
    ],
    stock: 80,
    sku: 'KINDLE-PW-11-8GB',
    tags: ['ereader', 'kindle', 'books', 'reading'],
    isActive: true,
    isFeatured: false,
    discount: 10
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Intelligent cordless vacuum with laser dust detection and LCD screen showing real-time particle count. Powerful suction and HEPA filtration.',
    price: 649,
    category: 'home',
    brand: 'Dyson',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
        alt: 'Dyson Vacuum'
      }
    ],
    stock: 35,
    sku: 'DYSON-V15-DETECT',
    tags: ['vacuum', 'cleaning', 'home', 'appliance'],
    isActive: true,
    isFeatured: false,
    discount: 5
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional pressure cooker that speeds up cooking by 2-6x. Functions as pressure cooker, slow cooker, rice cooker, steamer, and more.',
    price: 99,
    category: 'home',
    brand: 'Instant Pot',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
        alt: 'Instant Pot'
      }
    ],
    stock: 60,
    sku: 'INSTPOT-DUO-6QT',
    tags: ['kitchen', 'cooking', 'appliance', 'pressure-cooker'],
    isActive: true,
    isFeatured: false,
    discount: 25
  },
  {
    name: 'Canon EOS R6 Camera',
    description: 'Full-frame mirrorless camera with 20MP sensor, 4K video, and advanced autofocus. Perfect for professionals and enthusiasts.',
    price: 2499,
    category: 'electronics',
    brand: 'Canon',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606980621954-bf7fb3d3ea06?w=500',
        alt: 'Canon EOS R6'
      }
    ],
    stock: 20,
    sku: 'CANON-EOSR6-BODY',
    tags: ['camera', 'photography', 'mirrorless', 'professional'],
    isActive: true,
    isFeatured: true,
    discount: 0
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with responsive Boost cushioning and energy return. Features Primeknit upper for adaptive fit and comfort.',
    price: 190,
    category: 'sports',
    brand: 'Adidas',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
        alt: 'Adidas Ultraboost'
      }
    ],
    stock: 85,
    sku: 'ADIDAS-UB22-BLK-10',
    tags: ['running', 'shoes', 'sports', 'fitness'],
    isActive: true,
    isFeatured: false,
    discount: 15
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Advanced health and fitness features with always-on Retina display. Track workouts, monitor health metrics, and stay connected.',
    price: 429,
    category: 'electronics',
    brand: 'Apple',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
        alt: 'Apple Watch Series 9'
      }
    ],
    stock: 70,
    sku: 'AWATCH-S9-45MM-GPS',
    tags: ['smartwatch', 'apple', 'wearable', 'fitness'],
    isActive: true,
    isFeatured: true,
    discount: 0
  },
  {
    name: 'The North Face Jacket',
    description: 'Durable waterproof jacket with breathable DryVent technology. Perfect for hiking and outdoor adventures in any weather.',
    price: 249,
    category: 'clothing',
    brand: 'The North Face',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500',
        alt: 'North Face Jacket'
      }
    ],
    stock: 45,
    sku: 'TNF-JACKET-BLK-L',
    tags: ['jacket', 'outdoor', 'clothing', 'waterproof'],
    isActive: true,
    isFeatured: false,
    discount: 10
  },
  {
    name: 'LEGO Star Wars Millennium Falcon',
    description: 'Iconic building set with 7,541 pieces. Features detailed interior, exterior, and minifigures. Perfect for display and play.',
    price: 849,
    category: 'toys',
    brand: 'LEGO',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
        alt: 'LEGO Millennium Falcon'
      }
    ],
    stock: 15,
    sku: 'LEGO-SW-MF-75192',
    tags: ['lego', 'star-wars', 'toys', 'collectible'],
    isActive: true,
    isFeatured: true,
    discount: 0
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Display summary
    console.log('\nProducts by category:');
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
