<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EZrWEABhfyLHSalmmZez1ZvrKXbiXiFO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## Deploy to GitHub Pages

The app is configured for automatic deployment to GitHub Pages.

### Automatic Deployment (Recommended)
The GitHub Actions workflow will automatically build and deploy your app whenever you push to the `main` branch. No additional setup needed!

### Manual Deployment
If you prefer to deploy manually:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Configuration Details
- **Base URL**: `https://enigmax-oficial.github.io/culinare_2/`
- **Routing**: Uses `HashRouter` for proper navigation in subdirectories
- **Build Output**: Generated to `dist/` directory
- **Main Branch**: Automatically deploys when pushing to `main`

### GitHub Pages Settings
1. Go to your repository settings
2. Navigate to **Pages** section
3. Set the deployment source to **"GitHub Actions"** or **"Deploy from a branch"** → **"gh-pages"** branch