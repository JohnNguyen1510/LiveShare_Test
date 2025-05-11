# LiveShare Test Automation

End-to-end test automation framework for LiveShare using Playwright and Page Object Model pattern.

## Features

- Page Object Model architecture
- Google OAuth authentication handling
- Screenshot capture for debugging
- Parallel test execution
- Cross-browser testing
- HTML test reports
- Authentication state management
- Retry mechanisms for stability

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd liveshare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npm run install:browsers
   ```

4. Create `.env` file with test credentials:
   ```env
   GOOGLE_EMAIL=your.test@email.com
   GOOGLE_PASSWORD=your-test-password
   ```

## Project Structure

```
liveshare/
├── page-objects/      # Page object classes
│   ├── BasePage.js    # Base page with common functionality
│   ├── LoginPage.js   # Login page functionality
│   └── EventPage.js   # Event management functionality
├── tests/             # Test files
│   └── event-settings.spec.js  # Event settings tests
├── auth/              # Authentication state storage
├── screenshots/       # Debug screenshots
├── test-results/      # Test artifacts
├── playwright.config.js  # Playwright configuration
└── global-setup.js    # Global test setup
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with UI mode:
```bash
npm run test:ui
```

Run tests in debug mode:
```bash
npm run test:debug
```

Run tests in headed mode:
```bash
npm run test:headed
```

View test report:
```bash
npm run report
```

## Authentication

The framework uses Playwright's storage state feature to manage authentication:

1. First run will perform Google OAuth login
2. Authentication state is saved to `auth/user-auth.json`
3. Subsequent runs reuse the saved state

To force re-authentication, delete the `auth/user-auth.json` file.

## Screenshots

Screenshots are automatically captured:
- Before important actions
- After state changes
- On test failures

View screenshots in the `screenshots/` directory.

## Debugging

1. Use UI mode for visual debugging:
   ```bash
   npm run test:ui
   ```

2. Use debug mode for step-by-step execution:
   ```bash
   npm run test:debug
   ```

3. Check screenshots in `screenshots/` directory

4. View test traces in `test-results/` directory

## Common Issues

### Authentication Failures

- Verify credentials in `.env` file
- Check if Google account has 2FA enabled
- Delete `auth/user-auth.json` to force re-authentication

### Element Not Found

- Check if selectors are up to date
- Increase timeouts in `playwright.config.js`
- Review screenshots for UI changes

### Test Flakiness

- Increase retry count in configuration
- Add explicit waits for dynamic elements
- Check network conditions

## Contributing

1. Follow the Page Object Model pattern
2. Add JSDoc comments for methods
3. Include error handling
4. Add debug screenshots
5. Update README for new features

## License

This project is licensed under the ISC License. 