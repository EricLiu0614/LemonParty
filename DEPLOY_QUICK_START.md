# Quick Start: Deploy to Cloudflare Pages

## 🚀 Fastest Way (Dashboard Upload)

1. **Build your project**:
   ```bash
   npm run build
   ```

2. **Go to Cloudflare**:
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Create application** → **Pages** → **Upload assets**

3. **Upload**:
   - Drag the `dist` folder
   - Click **Deploy**

Done! Your app will be live at `https://lemon-party-xxx.pages.dev` 🎉

---

## 🔄 Automatic Deployment (Git Integration)

1. **Connect Git Repository**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
   - **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. **Configure Build**:
   ```
   Build command:        npm run build
   Build output directory: dist
   Framework preset:     Vite
   Node version:         20
   ```

3. **Save and Deploy**

From now on, every `git push` will auto-deploy! 🚀

---

## 💻 CLI Deployment (Optional)

If you want to use the command line:

1. **Install Wrangler** (if not installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login**:
   ```bash
   wrangler login
   ```

3. **Deploy**:
   ```bash
   npm run deploy:cf
   ```

---

## 🔧 Build Settings Summary

For Cloudflare Pages Dashboard:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |
| Install command | `npm install` |

---

## 🔑 Environment Variables (Optional)

If you need Gemini AI:

1. Go to your project → **Settings** → **Environment variables**
2. Add: `GEMINI_API_KEY` = your API key
3. Redeploy

---

## 📁 Project Structure

```
LemonParty/
├── dist/              # Built files (auto-generated)
├── public/
│   ├── _headers       # HTTP headers for Cloudflare
│   └── _redirects     # SPA routing rules
├── wrangler.toml      # Wrangler config
├── vite.config.ts     # Build config
└── package.json       # Scripts & dependencies
```

---

## ✅ What's Configured

- ✅ Vite build optimized for Cloudflare
- ✅ SPA routing (no 404 on refresh)
- ✅ Proper MIME types
- ✅ Security headers
- ✅ Environment variable support
- ✅ Deploy command: `npm run deploy:cf`

---

## 🆘 Troubleshooting

**Build fails?**
- Make sure Node.js 20+ is installed
- Run `npm install` first

**Module MIME type error?**
- Already fixed with `_headers` file
- Make sure to include the `public/` folder

**API key not working?**
- Add `GEMINI_API_KEY` in Cloudflare dashboard
- Rebuild after adding

---

## 🎯 Next Steps

1. Build: `npm run build`
2. Upload `dist` folder to Cloudflare Pages
3. Done! 🎉

For detailed instructions, see [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

