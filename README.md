# E-Commerce Platform

A full-stack e-commerce solution built with React frontend and Node.js backend, featuring real-time inventory management and secure payment processing with Stripe.

## 🚀 Features

### Frontend Features
- **Modern React UI** with Tailwind CSS styling
- **Responsive Design** that works on all devices
- **Product Catalog** with search, filtering, and pagination
- **Shopping Cart** with real-time updates
- **User Authentication** (Login/Register)
- **Order Management** with order tracking
- **Admin Dashboard** for product and order management
- **Real-time Updates** using Socket.io
- **Payment Integration** with Stripe

### Backend Features
- **RESTful API** with Express.js
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** with secure token handling
- **Stripe Payment Processing** for secure transactions
- **Real-time Inventory Management** with Socket.io
- **File Upload** support for product images
- **Input Validation** and error handling
- **Rate Limiting** and security middleware

## 🛠️ Tech Stack

### Frontend
- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Socket.io Client** - Real-time communication
- **Stripe Elements** - Payment processing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware

## 📁 Project Structure

```
ecommerce-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account for payment processing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   CLIENT_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Alternative Setup

**Start servers separately:**

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&category=electronics&search=laptop
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stock": 100,
  "images": [{"url": "image-url", "alt": "alt-text"}]
}
```

#### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 89.99
}
```

#### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### Cart Endpoints

#### Get User Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id"
}
```

### Order Endpoints

#### Create Payment Intent
```http
POST /api/orders/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    // Same structure as shipping address
  }
}
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_stripe_payment_intent_id",
  "shippingAddress": { /* address object */ },
  "billingAddress": { /* address object */ },
  "paymentMethod": "card"
}
```

#### Get User Orders
```http
GET /api/orders?page=1&limit=10&status=processing
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Cancel Order
```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Users (Admin)
```http
GET /api/users?page=1&limit=10&search=john&role=user
Authorization: Bearer <admin_token>
```

#### Update User (Admin)
```http
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true
}
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

## 🔧 Configuration

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env` file:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### MongoDB Setup

**Local MongoDB:**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/ecommerce`

**MongoDB Atlas (Cloud):**
1. Create account at [mongodb.com](https://mongodb.com)
2. Create a cluster
3. Get connection string and add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

## 🎨 Customization

### Styling
The project uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `client/src/index.css`
- Component-specific styles using Tailwind classes

### Adding New Features
1. **Backend**: Add new routes in `server/routes/`
2. **Frontend**: Add new components in `client/src/components/`
3. **Pages**: Add new pages in `client/src/pages/`

## 🚀 Deployment

### Backend Deployment (Heroku)

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy:
   ```bash
   cd server
   git subtree push --prefix=server heroku main
   ```

### Frontend Deployment (Netlify/Vercel)

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
CLIENT_URL=https://your-frontend-domain.com
PORT=5000
NODE_ENV=production
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you have any questions or need help with the project, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Advanced search with filters
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Inventory alerts
- [ ] Coupon system
- [ ] Affiliate program

---

**Happy Coding! 🎉**
