# Cloudflare Pages Deployment Guide

## Method 1: Deploy via Cloudflare Dashboard (Recommended for beginners)

### Step 1: Build your project locally
```bash
npm install
npm run build
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Choose **Connect to Git** (or **Direct Upload** if you prefer manual upload)

### Step 3: Configure Build Settings

If using **Connect to Git**:
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (default)
- **Node version**: `20` or higher

### Step 4: Environment Variables (Optional)

If you need Gemini AI features:
1. Go to **Settings** → **Environment variables**
2. Add:
   - Variable name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

### Step 5: Deploy

Click **Save and Deploy**. Cloudflare will automatically build and deploy your app.

Your app will be available at: `https://lemon-party-xxx.pages.dev`

---

## Method 2: Deploy via Wrangler CLI (For advanced users)

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

Or add to your project:
```bash
npm install --save-dev wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Build your project

```bash
npm run build
```

### Step 4: Deploy with Wrangler

```bash
wrangler pages deploy dist --project-name=lemon-party
```

Or add a deploy script to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && wrangler pages deploy dist --project-name=lemon-party"
  }
}
```

Then deploy with:
```bash
npm run deploy
```

---

## Method 3: Direct Upload (Quickest)

1. Build your project:
   ```bash
   npm run build
   ```

2. Go to Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**

3. Drag and drop your `dist` folder or select it

4. Click **Deploy site**

---

## Configuration Summary

### Build Settings for Cloudflare Pages:
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 20
```

### Environment Variables:
```
GEMINI_API_KEY=your_api_key_here
```

---

## Automatic Deployments

Once connected to Git, Cloudflare Pages will automatically:
- Deploy on every push to your main/master branch
- Create preview deployments for pull requests
- Provide deployment logs and rollback options

---

## Custom Domain (Optional)

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Follow the instructions to add your domain

---

## Troubleshooting

### Build fails with "command not found"
- Ensure Node version is set to 20 or higher in build settings

### Environment variables not working
- Make sure they're added in **Settings** → **Environment variables**
- Rebuild/redeploy after adding variables

### 404 errors on refresh
- Cloudflare Pages handles this automatically with SPA routing
- No additional configuration needed

---

## Useful Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare (if using Wrangler)
wrangler pages deploy dist --project-name=lemon-party
```

---

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

