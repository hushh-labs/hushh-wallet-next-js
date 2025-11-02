# 🎫 HUSHH Wallet Integration - Premium Card Dashboard

## 📋 Project Overview

Modern Next.js application for creating and managing premium digital wallet cards with seamless Apple Wallet & Google Wallet integration. Features a luxury metallic card design system with mobile-first responsive layout.

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Install Vercel CLI globally (for deployment)
npm install -g vercel@latest

# Login to Vercel (first time only)
vercel login
```

### Setup & Development
```bash
# 1. Clone and navigate
git clone <repository-url>
cd hushh-wallet-app

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.local.example .env.local
# Add your environment variables

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

## 🔄 Development Workflow

### Standard Development Process:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (optional)
git checkout -b feature/your-feature-name

# 3. Make your changes
# Edit files, add features, fix bugs...

# 4. Test locally
npm run dev
# Test on http://localhost:3000

# 5. Commit changes
git add .
git commit -m "feat: your descriptive commit message"

# 6. Push and deploy
git push origin main
```

### 🎯 Auto-Deployment Magic

This project uses **Husky Git hooks** + **Vercel CLI** for **automatic deployment**:

```bash
# When you push to main branch:
git push origin main

# This automatically:
# ✅ Triggers Husky pre-push hook
# ✅ Detects you're on main branch  
# ✅ Runs `vercel --prod --yes`
# ✅ Deploys to production
# ✅ Gives you live URL
# ✅ Completes git push
```

**Example Output:**
```bash
🚀 Vercel CLI: deploying to PRODUCTION…
Vercel CLI 48.6.0
Uploading [====================] (108.7KB/108.7KB)
Production: https://hushh-wallet-xyz.vercel.app
Queued → Building → Completing ✅
To https://github.com/hushh-labs/hushh-wallet-next-js.git
   abc123d..def456g  main -> main
```

## 📝 Commit Message Guidelines

Use conventional commit format:

```bash
# Features
git commit -m "feat: add new metallic card design"
git commit -m "feat: implement mobile-first grid system"

# Fixes  
git commit -m "fix: card padding on mobile devices"
git commit -m "fix: status chip text visibility"

# Styling
git commit -m "style: reduce card internal padding"
git commit -m "style: improve mobile typography"

# Documentation
git commit -m "docs: update deployment workflow"

# Configuration
git commit -m "config: optimize mobile breakpoints"
```

## 🌟 Recent Major Improvements

### ✅ Mobile-First Grid System (Latest)
- **Single-source rail system**: 16px gutter, 420px max width
- **Perfect alignment**: All sections follow exact same left/right rails
- **Responsive grid**: 1-up mobile, 2-up large phones (≥520px)
- **Overflow protection**: Prevents horizontal scrolling

### ✅ Premium Card Styling
- **Metallic finishes**: Gold (Live) and Silver (Awaiting) editions
- **8-layer design**: Authentic metal card visual depth
- **Visible boundaries**: Subtle keylines on white background
- **Optimized padding**: Better content breathing room

### ✅ Typography & Contrast
- **Dark text**: #111 titles, #525 descriptions for readability
- **Fluid sizing**: Responsive clamp() functions
- **Mobile optimization**: Touch-friendly 44px hit targets

## 🛠️ Manual Deployment Commands

### Production Deployment:
```bash
# Deploy to production
vercel --prod --yes

# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>
```

### Preview Deployment:
```bash
# Deploy preview (feature branches)
vercel --yes

# Get preview URL for testing
vercel inspect <deployment-url>
```

### Cache Management:
```bash
# Clear cache and redeploy
vercel cache purge --yes
git push origin main
```

## 📱 Testing Workflow

### Local Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Test responsive design
# - Resize browser window
# - Use Chrome DevTools mobile simulation
# - Test on actual mobile devices

# 3. Check console for errors
# - Open browser DevTools (F12)
# - Look for red errors in console
# - Fix any React hydration issues
```

### Production Testing:
```bash
# 1. Deploy to production
git push origin main

# 2. Test live URL
# - Open deployment URL
# - Test on multiple devices
# - Verify card alignment and responsiveness

# 3. Verify specific features
# - Dashboard loads correctly
# - Cards display properly
# - Mobile layout works
# - Status chips are visible
```

## 🎨 Design System

### Color Tokens:
```css
/* Metallic Finishes */
--gold-gradient: Gold cards (Live status)
--silver-gradient: Silver cards (Awaiting status)

/* Typography */
--ink: #111111 (Primary text)
--muted: #525252 (Secondary text)

/* Layout */
--phone-gutter: 16px (Mobile side padding)
--phone-rail-max: 420px (Max content width)
```

### Responsive Breakpoints:
```css
/* Mobile First */
@media (max-width: 360px)   /* XS phones */
@media (max-width: 480px)   /* Small phones */
@media (max-width: 767px)   /* All mobile */
@media (min-width: 520px) and (max-width: 767px) /* Large phones */
@media (min-width: 768px)   /* Tablet+ */
```

## 🔧 Project Structure

```
hushh-wallet-app/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── cards/             # Card creation flows
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles & design system
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
├── passModels/               # Apple Wallet pass templates
├── .husky/                   # Git hooks (auto-deployment)
├── .env.local                # Environment variables
└── vercel.json              # Deployment configuration
```

## 🐛 Troubleshooting

### Common Issues & Solutions:

#### ❌ "Git push fails during deployment"
```bash
# Check Vercel status
vercel status

# Try manual deployment
vercel --prod --yes

# Check deployment logs
vercel logs
```

#### ❌ "Cards not aligned on mobile"
```bash
# Check CSS variables
# Verify --phone-gutter and --phone-rail-max values
# Test with debug grid: add 'grid-debug' class to body

# Force cache clear
vercel cache purge --yes
```

#### ❌ "Text not visible on cards"
```bash
# Verify color variables in globals.css
# Check for white text on white background
# Look for missing !important overrides
```

#### ❌ "Husky command not found"
```bash
# Reinstall Husky
npm run prepare

# Or install globally
npm install -g husky
```

#### ❌ "Environment variables missing"
```bash
# Check .env.local file exists
# Verify all required variables are set
# Restart development server: npm run dev
```

## 🚦 Branch Strategy

- **`main`**: Production branch (auto-deploys to live site)
- **`feature/*`**: Feature branches (create preview deployments)
- **`fix/*`**: Bug fix branches (create preview deployments)

### Creating Feature Branches:
```bash
# Create and switch to feature branch
git checkout -b feature/mobile-optimization

# Make changes and commit
git add .
git commit -m "feat: optimize mobile card layout"

# Push feature branch (creates preview deployment)
git push origin feature/mobile-optimization

# Create pull request to main
# After review, merge to main (triggers production deployment)
```

## 🌍 Live Deployment & URLs

### Production URLs:
- **✅ Clean URL Available**: `https://hushh-wallet-app.vercel.app`
- **🎯 Target Ultra-Clean URL**: `https://hushh-wallet.vercel.app` (optional setup below)
- **Current Deployment**: `https://hushh-wallet-6n9bdpnia-ankit-kumar-singhs-projects-390074cd.vercel.app`

### 🔧 Setting Up Clean Domain URL

#### Option 1: Rename Vercel Project (Recommended)
```bash
# Method 1: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: "hushh-wallet-app"
3. Go to Settings → General
4. Change "Project Name" to: hushh-wallet
5. Save changes
6. Your new URL will be: https://hushh-wallet.vercel.app

# Method 2: Via CLI
vercel project rm hushh-wallet-app
vercel --name hushh-wallet --prod
```

#### Option 2: Custom Domain (Professional)
```bash
# Set up custom domain (requires domain ownership)
vercel domains add hushh-wallet.com
vercel domains assign hushh-wallet.com
```

### 📊 Monitoring & Analytics

### Vercel Dashboard:
- **Project**: `ankit-kumar-singhs-projects-390074cd/hushh-wallet-app`
- **Git Repository**: `hushh-labs/hushh-wallet-next-js`
- **Analytics**: Available in Vercel dashboard

### Deployment URLs:
- **Production**: `https://hushh-wallet-nujox0nm8-ankit-kumar-singhs-projects-390074cd.vercel.app`
- **Preview**: Generated for feature branches
- **Inspection**: Use `vercel inspect <url>` for details

### 🚀 Auto-Deployment Status Tracking

Every successful push to main branch:
```bash
✅ Code pushed to GitHub
✅ Husky pre-push hook triggered  
✅ Vercel deployment started
✅ Build completed successfully
✅ Live on: https://hushh-wallet-nujox0nm8-ankit-kumar-singhs-projects-390074cd.vercel.app
✅ Changes reflected instantly
```

**Deployment Timeline**: ~30-60 seconds from push to live
**Status Check**: Visit production URL to verify changes
**Rollback**: `vercel rollback` if needed

## 🔒 Security & Environment

### Required Environment Variables:
```bash
# .env.local
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
# Add other required variables
```

### Apple Wallet Certificates:
- Stored in `/certs/` directory
- Required for generating wallet passes
- Keep private keys secure

## 📚 Additional Resources

### Documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Apple Wallet Developer Guide](https://developer.apple.com/wallet/)

### Design System:
- Metallic card finishes with authentic 8-layer depth
- Mobile-first responsive grid system
- Premium typography with Gilroy font family

---

## 🎉 Ready to Deploy!

The simplest workflow:
1. **Make changes** to your code
2. **Test locally**: `npm run dev`
3. **Commit**: `git add . && git commit -m "feat: your change"`
4. **Deploy**: `git push origin main`
5. **Done!** Your changes are live automatically! 🚀

**Current Status**: ✅ Fully automated deployment pipeline ready!
