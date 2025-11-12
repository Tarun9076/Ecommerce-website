# Vercel Deployment Checklist

Use this checklist to ensure your deployment is successful.

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] Created `vercel.json` configuration file
- [x] Created `api/index.js` serverless function entry point
- [x] Updated Socket.io to handle serverless limitations
- [x] Created MongoDB connection pooling for serverless
- [x] Configured CORS properly
- [x] Added environment variable templates

### 2. Environment Variables Setup

Before deploying, prepare these environment variables:

#### Required Variables:
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `CLIENT_URL` - Your Vercel deployment URL (set after first deployment)
- [ ] `NODE_ENV` - Set to `production`

#### Optional Variables:
- [ ] `EMAIL_HOST` - For email functionality
- [ ] `EMAIL_PORT` - For email functionality
- [ ] `EMAIL_USER` - For email functionality
- [ ] `EMAIL_PASS` - For email functionality
- [ ] `EMAIL_FROM` - For email functionality

### 3. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a free cluster
- [ ] Create database user
- [ ] Whitelist IP addresses (use `0.0.0.0/0` for all)
- [ ] Get connection string
- [ ] Replace `<password>` in connection string

### 4. Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys from dashboard
- [ ] Use test keys for development
- [ ] Use live keys for production

### 5. GitHub Repository
- [ ] Push code to GitHub
- [ ] Verify all files are committed
- [ ] Check that `.env` files are in `.gitignore`

## Deployment Steps

### Step 1: Deploy to Vercel
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Configure project settings:
  - Framework Preset: Other
  - Root Directory: `./` (root)
  - Build Command: `cd client && npm install && npm run build`
  - Output Directory: `client/build`
  - Install Command: `npm install && cd client && npm install && cd ../api && npm install`

### Step 2: Set Environment Variables
- [ ] Go to Project Settings → Environment Variables
- [ ] Add all required environment variables
- [ ] Set variables for Production, Preview, and Development
- [ ] Save changes

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### Step 4: Update CLIENT_URL
- [ ] Copy your deployment URL
- [ ] Update `CLIENT_URL` environment variable
- [ ] Redeploy

### Step 5: Verify Deployment
- [ ] Visit your deployment URL
- [ ] Test homepage loads
- [ ] Test product listing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test cart functionality
- [ ] Test checkout (use Stripe test card)

## Post-Deployment Checklist

### 1. Functionality Testing
- [ ] Homepage loads correctly
- [ ] Product listing works
- [ ] Product detail pages work
- [ ] User registration works
- [ ] User login works
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Order creation works
- [ ] Payment processing works (test mode)
- [ ] Admin dashboard works (if applicable)

### 2. API Testing
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Authorization works
- [ ] CORS is configured correctly
- [ ] Rate limiting works

### 3. Database Testing
- [ ] Database connection works
- [ ] Data is stored correctly
- [ ] Data is retrieved correctly
- [ ] Database queries work

### 4. Error Handling
- [ ] Error messages display correctly
- [ ] 404 pages work
- [ ] 500 errors are handled
- [ ] Network errors are handled

### 5. Security
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured correctly
- [ ] Rate limiting is working
- [ ] Authentication is secure
- [ ] Environment variables are set correctly

## Troubleshooting

### Build Fails
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies are installed
- [ ] Check Node.js version (Vercel uses Node 18.x)
- [ ] Verify build command is correct

### API Not Working
- [ ] Verify environment variables are set
- [ ] Check MongoDB connection string
- [ ] Verify CORS settings
- [ ] Check function logs in Vercel dashboard
- [ ] Test API endpoints directly

### Database Connection Issues
- [ ] Verify MongoDB Atlas IP whitelist
- [ ] Check database user credentials
- [ ] Verify connection string format
- [ ] Check database connection logs

### Environment Variables Not Loading
- [ ] Verify variables are set in Vercel dashboard
- [ ] Check variable names (case-sensitive)
- [ ] Redeploy after adding variables
- [ ] Verify variables are set for correct environment

## Next Steps

### 1. Custom Domain (Optional)
- [ ] Add custom domain in Vercel settings
- [ ] Configure DNS settings
- [ ] Update `CLIENT_URL` environment variable
- [ ] Verify SSL certificate

### 2. Production Stripe Keys
- [ ] Get live Stripe keys
- [ ] Update environment variables
- [ ] Test payment processing
- [ ] Redeploy

### 3. Monitoring and Error Tracking
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure monitoring
- [ ] Set up alerts
- [ ] Monitor performance

### 4. Database Backups
- [ ] Configure database backups
- [ ] Set up backup schedule
- [ ] Test backup restoration
- [ ] Document backup process

### 5. Staging Environment
- [ ] Create staging environment
- [ ] Configure staging environment variables
- [ ] Test in staging before production
- [ ] Set up CI/CD pipeline

## Important Notes

⚠️ **Socket.io Limitation**: Vercel serverless functions don't support WebSockets. Real-time features are disabled by default. If you need real-time features, deploy the backend separately to Railway, Render, or a VPS.

⚠️ **File Uploads**: If you need file uploads, use a cloud storage service like AWS S3 or Cloudinary.

⚠️ **Database**: Use MongoDB Atlas or another cloud database service. Local databases won't work on Vercel.

⚠️ **Environment Variables**: Never commit `.env` files to Git. Always use Vercel's environment variable settings.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection logs
3. Verify all environment variables are set
4. Test API routes directly
5. Check Vercel documentation: https://vercel.com/docs

---

**Good luck with your deployment! 🚀**

