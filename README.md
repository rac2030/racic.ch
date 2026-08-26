# racic.ch — Portfolio, Wiki & Blog

Personal website for Michel Racic: Software Engineer, Automation Specialist, Always up to hack for fun.

Built with [Astro](https://astro.build) and deployed to [GitHub Pages](https://pages.github.com).

## Sections

- **Blog** — Technical articles, how-tos, and project write-ups
- **Projects** — IoT, hardware, LoRaWAN, and hackathon projects
- **Wiki** — Quick references, dev notes, and useful commands (semantic wiki)
- **Bookmarks** — Curated link collections and resources

## Comments

Articles use [giscus](https://giscus.app/) (powered by GitHub Discussions) for comments. To enable:

1. Enable the [giscus GitHub App](https://github.com/apps/giscus) on your repository
2. Get your `repo-id` and `category-id` from https://giscus.app
3. Update the values in `src/components/Comments.astro`

## Development

```bash
npm install
npm run dev       # Start dev server at localhost:4321
npm run build     # Build for production
npm run preview   # Preview the production build
```

## Testing

```bash
# Requires Node 22+
export PATH="/tmp/node-v22.16.0-linux-x64/bin:$PATH"

# Build first (required for e2e tests)
npm run build

# Run unit tests only
npx jest

# Run e2e tests only
npx playwright test

# Run all tests
npx jest --silent && npx playwright test

# View HTML test report
npx playwright show-report test-results/html
```

- **Unit tests** (`tests/unit/`) — content schemas, site config, utility functions
- **E2E tests** (`tests/e2e/`) — page rendering, navigation, links, search, features

## Deployment

### GitHub Pages (default)

Push to `main` — GitHub Actions will build and deploy automatically.

### Firebase Hosting (alternative, not configured for this repo)

The `firebase.json` is included and pre-configured to serve from `dist/`, but the project is not linked to any Firebase project. To deploy to Firebase:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in and initialize the project:
   ```bash
   firebase login
   firebase init
   ```
   Select your Firebase project when prompted. This generates a `.firebaserc` file linking the project.

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

#### CI/CD with GitHub Actions (optional)

To automate Firebase deploys on push:

1. Generate a deploy token:
   ```bash
   firebase login:ci
   ```
2. Add the token as a GitHub repository secret named `FIREBASE_DEPLOY_TOKEN`
3. Add a deploy step to `.github/workflows/deploy.yml`:
   ```yaml
   - name: Deploy to Firebase
     run: firebase deploy --token ${{ secrets.FIREBASE_DEPLOY_TOKEN }}
   ```
