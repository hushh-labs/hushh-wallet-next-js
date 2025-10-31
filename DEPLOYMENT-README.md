# 🚀 CLI Auto-Deployment Setup

## Overview

This project uses **Husky Git hooks** + **Vercel CLI** for automatic deployment on every push to the `main` branch. No more manual deployments needed!

## ✅ What's Implemented

- **Automatic deployment** on `git push` to `main` branch
- **Preview deployments** for feature branches  
- **Fixed redirect issues** (/ → /dashboard)
- **Production-optimized** Husky setup

## 🔧 Setup Details

### Files Modified/Created:

#### 1. `.husky/pre-push` - Deployment Hook
```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "🚀 Vercel CLI: deploying to PRODUCTION…"
  vercel --prod --yes
else
  echo "🔍 Vercel CLI: creating PREVIEW deployment…"
  vercel --yes
fi
```

#### 2. `package.json` - Dependencies
```json
{
  "scripts": {
    "prepare": "husky || exit 0"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

#### 3. `next.config.js` - Redirect Fix
```js
async redirects() {
  return [
    {
      source: '/',
      destination: '/dashboard',
      permanent: false, // 307 redirect
    },
  ];
}
```

#### 4. `.vercel/` - Project Linking
- Project linked to: `ankit-kumar-singhs-projects-390074cd/hushh-wallet-app`
- Auto-detects Next.js configuration

## 🚀 How to Use

### Normal Development Workflow:
```bash
# Make your changes
git add .
git commit -m "feat: add new feature"

# This triggers automatic deployment! 🎉
git push
```

### What Happens:
1. **Git push** triggers Husky pre-push hook
2. **Hook detects branch** (main = production, others = preview)
3. **Vercel CLI** automatically deploys
4. **Live URL** is generated and displayed
5. **Git push** completes after successful deployment

### Example Output:
```bash
🚀 Vercel CLI: deploying to PRODUCTION…
Vercel CLI 48.6.0
Uploading [====================] (2.5KB/2.5KB)
Production: https://hushh-wallet-3qp7laf19-ankit-kumar-singhs-projects-390074cd.vercel.app
Queued → Building → Completing ✅
To https://github.com/hushh-labs/hushh-wallet-next-js.git
   5df119e..aa9404b  main -> main
```

## 🎯 Branch Strategy

- **`main` branch**: Auto-deploys to **Production**
- **Feature branches**: Auto-deploys to **Preview** URLs
- **Pull requests**: Get their own preview deployments

## 🛠️ Manual Commands (if needed)

### Deploy Production:
```bash
vercel --prod --yes
```

### Deploy Preview:
```bash
vercel --yes
```

### Check Deployments:
```bash
vercel ls
```

### Clear Cache:
```bash
vercel cache purge --yes
```

### Inspect Deployment:
```bash
vercel inspect <deployment-url>
```

## 🔧 Prerequisites

Make sure you have:
- **Vercel CLI** installed: `npm i -g vercel@latest`
- **Vercel account** logged in: `vercel login`
- **Project linked**: `vercel link --yes` (already done)

## 🐛 Troubleshooting

### Issue: "Husky command not found"
**Solution**: Husky is a dev dependency, this is normal in production builds. The `|| exit 0` handles this gracefully.

### Issue: "Failed to push"
**Solution**: Deployment failed. Check Vercel dashboard or run:
```bash
vercel logs <deployment-url>
```

### Issue: Redirect not working
**Solution**: Clear cache and redeploy:
```bash
vercel cache purge --yes
git push
```

### Issue: Wrong deployment environment
**Solution**: Check your current branch:
```bash
git branch --show-current
```

## 📊 Project URLs

### Current Production:
- **Latest**: `https://hushh-wallet-3qp7laf19-ankit-kumar-singhs-projects-390074cd.vercel.app`
- **Dashboard**: Automatically redirects from root URL

### Vercel Dashboard:
- **Project**: `ankit-kumar-singhs-projects-390074cd/hushh-wallet-app`
- **Git Repo**: `hushh-labs/hushh-wallet-next-js`

## 🔄 Cache Management

### Automatic Cache Clearing:
Headers configured in `next.config.js` for dashboard pages:
```js
async headers() {
  return [{
    source: '/(dashboard|cards/:path*)',
    headers: [
      { key: 'Cache-Control', value: 'no-store, must-revalidate' }
    ]
  }];
}
```

## ✅ Verified Working

- ✅ Root URL redirects to `/dashboard`
- ✅ Auto-deployment on git push
- ✅ Production builds successfully
- ✅ No React hydration errors
- ✅ Clean console logs
- ✅ Mobile-responsive dashboard

## 📝 Notes

- **No more manual deployments needed**
- **Every commit to `main` goes live automatically**
- **Preview URLs for testing feature branches**
- **Vercel CLI handles builds and deployments**
- **Git hooks ensure consistency**

---

**Ready to deploy!** Just `git push` and watch the magic happen! 🎉
# Auto-deployment test - Fri Oct 31 21:09:19 IST 2025
