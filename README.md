# LiveShare Test Automation

Automated end-to-end testing framework for LiveShare built with Playwright and Page Object Model.

##  Overview

- UI/UX testing for event creation and management
- Authentication workflows and verification
- Settings customization testing
- Cross-browser compatibility
- Visual regression testing

##  Setup

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install

# Configure test credentials in .env
GOOGLE_EMAIL=your.test@email.com
GOOGLE_PASSWORD=your-test-password
BASE_URL=https://app.livesharenow.com

MAILOSAUR_API_KEY=Sc9PZWQWvHFvzQPOB7NEWQh0ldSOWVis
MAILOSAUR_SERVER_ID=rh4q55kj

LIVESHARE_EMAIL=goes-silver@rh4q55kj.mailosaur.net
LIVESHARE_PASSWORD=t123
```

##  Running Tests

```bash

#Save token for login
npm run setup:full

# Run with UI mode for debugging
npm run test:ui

# Run specific test file
npm test --grep tests/event-settings.spec.js
npm test --grep 'TC-APP-001' --ui

# Run with specific browser
npm test --grep --project=chromium
```

##  Project Structure

```
liveshare/
├── page-objects/     # Page Object classes
├── tests/            # Test specifications
├── test-assets/      # Test data and upload files
├── screenshots/      # Debug screenshots
├── playwright.config.js
```

##  Debugging

1. **UI Mode**: Interactive test debugger
   ```bash
   npm run test:ui
   ```

2. **Screenshots**: Check `screenshots/` directory

3. **Trace Viewer**: View detailed test execution
   ```bash
   npx playwright show-trace test-results/traces/trace.zip
   ```

4. **HTML Reports**: Open `playwright-report/index.html`

##  Troubleshooting

1. **Authentication Issues**
   - Check `.env` credentials
   - Delete `auth/user-auth.json` to re-authenticate

2. **Element Not Found**
   - Verify selectors in page objects
   - Increase timeouts in config

3. **Test Stability**
   - Add explicit waits for dynamic elements
   - Ensure test data prerequisites exist

##  Contribution Guidelines

1. Follow Page Object Model pattern
2. Include appropriate error handling
3. Add JSDoc comments and screenshots
4. Update README for significant changes 