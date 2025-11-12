# Quick Start Guide - Vercel Deployment

This guide will help you quickly deploy your ecommerce platform to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas account (free tier available)
- Stripe account (for payments)

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install && cd ../api && npm install`

## Step 3: Set Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your_strong_random_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
CLIENT_URL=https://your-project.vercel.app
NODE_ENV=production
```

### How to Get Values:

1. **MONGODB_URI**: 
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string from "Connect" button
   - Replace `<password>` with your database password

2. **JWT_SECRET**: 
   - Generate a random string: `openssl rand -base64 32`
   - Or use an online generator

3. **Stripe Keys**: 
   - Get from [Stripe Dashboard](https://dashboard.stripe.com)
   - Use test keys for development
   - Use live keys for production

4. **CLIENT_URL**: 
   - Set this after first deployment
   - Use your Vercel deployment URL

## Step 4: Deploy

Click "Deploy" and wait for the deployment to complete.

## Step 5: Update CLIENT_URL

After first deployment:

1. Copy your deployment URL (e.g., `https://your-project.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `CLIENT_URL` with your deployment URL
4. Redeploy

## Step 6: Test Your Deployment

1. Visit your deployment URL
2. Test registration/login
3. Test product browsing
4. Test cart functionality
5. Test checkout (use Stripe test card: `4242 4242 4242 4242`)

## Important Notes

⚠️ **Socket.io Limitation**: Vercel serverless functions don't support WebSockets. Real-time features are disabled by default. If you need real-time features, deploy the backend separately to Railway, Render, or a VPS.

⚠️ **File Uploads**: If you need file uploads, use a cloud storage service like AWS S3 or Cloudinary.

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are installed
- Check Node.js version (Vercel uses Node 18.x)

### API Not Working
- Verify environment variables are set
- Check MongoDB connection string
- Verify CORS settings
- Check function logs in Vercel dashboard

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Verify connection string format

## Next Steps

1. Set up custom domain (optional)
2. Configure production Stripe keys
3. Set up monitoring and error tracking
4. Configure database backups
5. Set up staging environment

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For issues:
- Check Vercel deployment logs
- Check MongoDB Atlas connection logs
- Verify environment variables
- Check Vercel documentation: https://vercel.com/docs

---

**Happy Deploying! 🚀**

