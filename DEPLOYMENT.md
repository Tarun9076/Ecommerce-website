# Vercel Deployment Guide

This guide will help you deploy your ecommerce platform to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. MongoDB Atlas account (cloud database) or another MongoDB cloud service
3. Stripe account for payment processing
4. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Environment Variables

```env
# MongoDB Connection (Use MongoDB Atlas for cloud database)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_very_strong_jwt_secret_key_here

# Stripe Keys (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Client URL (Will be your Vercel deployment URL)
CLIENT_URL=https://your-app.vercel.app

# Node Environment
NODE_ENV=production
```

### Optional Environment Variables

```env
# Enable Socket.io (only if deploying backend separately)
REACT_APP_ENABLE_SOCKET=false
REACT_APP_SERVER_URL=https://your-backend-url.com

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com
```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get your connection string and replace `<password>` with your database password
6. Add the connection string to your environment variables as `MONGODB_URI`

## Step 3: Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from the Developers section
3. Use test keys for development, live keys for production
4. Add the keys to your environment variables

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Set up environment variables when prompted
   - Deploy to production

### Option B: Deploy via GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install && cd ../api && npm install`

6. Add Environment Variables:
   - Go to Project Settings → Environment Variables
   - Add all the environment variables listed in Step 1
   - Make sure to set them for Production, Preview, and Development

7. Click "Deploy"

## Step 5: Configure Vercel Settings

After deployment, update your environment variables:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Update `CLIENT_URL` with your actual Vercel deployment URL:
   ```
   CLIENT_URL=https://your-project-name.vercel.app
   ```

4. Redeploy to apply the changes

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the following:
   - Homepage loads
   - Product listing works
   - User registration/login works
   - Cart functionality works
   - Checkout process works (test mode)

## Important Notes

### Socket.io Limitation

⚠️ **Important**: Vercel serverless functions don't support WebSockets, so Socket.io real-time features are disabled by default. The app will work without real-time updates. If you need real-time features:

1. Deploy the backend separately to a service that supports WebSockets:
   - [Railway](https://railway.app)
   - [Render](https://render.com)
   - [Fly.io](https://fly.io)
   - A VPS (DigitalOcean, AWS EC2, etc.)

2. Set the following environment variables:
   ```env
   REACT_APP_ENABLE_SOCKET=true
   REACT_APP_SERVER_URL=https://your-backend-url.com
   ```

### File Uploads

If your app uses file uploads (like product images), you'll need to:
1. Use a cloud storage service (AWS S3, Cloudinary, etc.)
2. Update the upload routes to use the cloud storage
3. Store image URLs in the database instead of files

### Database Seeding

After deployment, you may want to seed your database with initial data:

1. Create a seed script that can run in a serverless function
2. Or run seed scripts locally pointing to your production database
3. Or use MongoDB Atlas's data import feature

## Troubleshooting

### Build Fails

- Check that all dependencies are installed correctly
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check build logs in Vercel dashboard

### API Routes Not Working

- Verify that environment variables are set correctly
- Check that MongoDB connection string is correct
- Verify CORS settings in `api/index.js`

### Database Connection Issues

- Verify MongoDB Atlas IP whitelist includes Vercel's IPs
- Check that database user credentials are correct
- Ensure the connection string is properly formatted

### Environment Variables Not Loading

- Make sure environment variables are set in Vercel dashboard
- Redeploy after adding new environment variables
- Check that variable names match exactly (case-sensitive)

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update `CLIENT_URL` environment variable with your custom domain

## Monitoring and Logs

- View deployment logs in Vercel dashboard
- Check function logs for API errors
- Use Vercel's analytics to monitor performance
- Set up error tracking (Sentry, etc.) for production

## Security Best Practices

1. **Never commit `.env` files** to Git
2. Use strong, randomly generated JWT secrets
3. Use Stripe live keys only in production
4. Enable MongoDB Atlas security features (IP whitelist, etc.)
5. Regularly update dependencies
6. Use HTTPS (Vercel provides this automatically)
7. Enable rate limiting (already configured in the API)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection logs
3. Verify all environment variables are set
4. Test API routes directly using curl or Postman
5. Check Vercel's documentation: https://vercel.com/docs

## Next Steps

After successful deployment:
1. Set up monitoring and error tracking
2. Configure custom domain (optional)
3. Set up CI/CD for automatic deployments
4. Configure database backups
5. Set up staging environment for testing

---

**Happy Deploying! 🚀**

