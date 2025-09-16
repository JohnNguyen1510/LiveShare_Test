# LiveShare Test Automation Framework

Professional end-to-end testing framework for LiveShare built with Playwright, featuring enterprise-grade architecture and best practices.

## 🚀 Features

- **Multi-Environment Support**: Dev, Staging, Production configurations
- **Comprehensive Testing**: UI, API, and Integration tests
- **Robust Authentication**: Google OAuth with retry mechanisms
- **Page Object Model**: Maintainable and scalable test architecture
- **Test Data Factory**: Dynamic test data generation
- **Cross-Browser Testing**: Chrome, Firefox, Safari support
- **Advanced Reporting**: HTML reports with screenshots and videos
- **CI/CD Ready**: Optimized for continuous integration

## 📁 Project Structure

```
LiveShare_Test/
├── src/
│   ├── config/
│   │   ├── config-loader.js          # Configuration loader
│   │   └── environments/             # Environment-specific configs
│   │       ├── dev.js
│   │       ├── staging.js
│   │       └── production.js
│   ├── pages/                        # Page Object classes
│   │   ├── base-page.js             # Base page with common utilities
│   │   ├── login-page.js            # Authentication handling
│   │   └── event-page.js            # Event management
│   ├── tests/                        # Test specifications
│   │   ├── ui/                      # UI tests
│   │   │   └── event-management.spec.js
│   │   └── api/                     # API tests
│   │       └── events-api.spec.js
│   ├── utils/                        # Utility functions
│   │   ├── test-data-factory.js     # Test data generation
│   │   └── auth-utils.js            # Authentication utilities
│   ├── fixtures/                     # Test fixtures
│   │   └── base-fixtures.js         # Custom fixtures
│   └── auth/                         # Authentication state
├── test-assets/                      # Test data and files
├── screenshots/                      # Debug screenshots
├── playwright.config.js             # Playwright configuration
├── global-setup.js                  # Global test setup
└── package.json                     # Dependencies and scripts
```

## 🛠️ Setup

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LiveShare_Test

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Copy environment configuration
cp env.example .env

# Configure your credentials in .env
GOOGLE_EMAIL=your.test@email.com
GOOGLE_PASSWORD=your-test-password
```

### Environment Configuration

Create a `.env` file with your credentials:

```env
# Environment
MODE=dev

# Authentication
GOOGLE_EMAIL=your.test@email.com
GOOGLE_PASSWORD=your-test-password

# Test Configuration
HEADLESS=0
FORCE_AUTH=false
```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with UI mode for debugging
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific test suites
npm run test:ui-only      # UI tests only
npm run test:api-only     # API tests only
```

### Environment-Specific Testing

```bash
# Run tests against different environments
npm run test:dev          # Development environment
npm run test:staging      # Staging environment
npm run test:prod         # Production environment
```

### Test Categories

```bash
# Run specific test categories
npm run test:auth         # Authentication tests
npm run test:smoke        # Smoke tests
npm run test:regression   # Regression tests
```

### Debugging

```bash
# Debug mode with step-by-step execution
npm run test:debug

# Generate and view reports
npm run report

# Clean test artifacts
npm run clean
```

## 🔧 Configuration

### Environment Files

Each environment has its own configuration file in `src/config/environments/`:

- **dev.js**: Development environment settings
- **staging.js**: Staging environment settings  
- **production.js**: Production environment settings

### Test Configuration

Key configuration options in `playwright.config.js`:

```javascript
{
  timeout: 60000,           // Test timeout
  retries: 2,              // Retry failed tests
  workers: 1,              // Parallel workers
  headless: false,         // Browser visibility
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}
```

## 📝 Writing Tests

### Page Object Pattern

```javascript
// src/pages/event-page.js
class EventPage extends BasePage {
  async createEvent(eventData) {
    await this.safeClick(this.selectors.createEventButton);
    await this.safeFill(this.selectors.eventNameInput, eventData.name);
    await this.safeClick(this.selectors.saveButton);
  }
}
```

### Test Structure

```javascript
// src/tests/ui/event-management.spec.js
const { test, expect } = require('@playwright/test');
const { test: baseTest } = require('../../fixtures/base-fixtures');

const testWithFixtures = baseTest;

testWithFixtures('should create a new event', async ({ authenticatedEventPage }) => {
  const eventData = TestDataFactory.createEventData('Test Event');
  const success = await authenticatedEventPage.createEvent(eventData);
  expect(success).toBe(true);
});
```

### Test Data Factory

```javascript
// Generate unique test data
const eventData = TestDataFactory.createEventData('Test Event', true);
const userData = TestDataFactory.createUserData('Test User', true);
```

## 🔐 Authentication

The framework handles Google OAuth authentication automatically:

1. **Automatic Setup**: Authentication state is saved and reused
2. **Retry Mechanism**: Failed authentications are retried with backoff
3. **Token Management**: OAuth tokens are captured and stored
4. **State Persistence**: Login state persists across test runs

### Manual Authentication

```bash
# Force re-authentication
FORCE_AUTH=true npm test

# Clear authentication state
rm -rf src/auth/user-auth.json
```

## 📊 Reporting

### HTML Reports

```bash
# Generate and open HTML report
npm run report
```

### Screenshots and Videos

- **Screenshots**: Automatically captured on test failures
- **Videos**: Recorded for failed tests (configurable)
- **Traces**: Detailed execution traces for debugging

### Test Results

Results are stored in:
- `test-results/`: Test execution artifacts
- `playwright-report/`: HTML reports
- `screenshots/`: Debug screenshots
- `videos/`: Test recordings

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failures**
   ```bash
   # Clear auth state and re-authenticate
   rm -rf src/auth/user-auth.json
   FORCE_AUTH=true npm test
   ```

2. **Element Not Found**
   - Check selectors in page objects
   - Increase timeouts in configuration
   - Verify page load state

3. **Test Stability**
   - Add explicit waits for dynamic elements
   - Use retry mechanisms for flaky operations
   - Ensure test data prerequisites exist

4. **Environment Issues**
   ```bash
   # Verify environment configuration
   MODE=dev npm test
   ```

### Debug Mode

```bash
# Run with debug mode
npm run test:debug

# Run specific test in debug mode
npm run test:debug -- --grep "should create event"
```

## 🤝 Contributing

### Development Guidelines

1. **Follow Page Object Model**: Keep page logic in page objects
2. **Use Test Data Factory**: Generate dynamic test data
3. **Add Error Handling**: Include proper error handling and logging
4. **Write Descriptive Tests**: Use clear test names and descriptions
5. **Update Documentation**: Keep README and comments current

### Code Style

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Adding New Tests

1. Create page objects in `src/pages/`
2. Add test data factories in `src/utils/`
3. Write tests in appropriate `src/tests/` subdirectory
4. Update configuration if needed
5. Add documentation

## 📚 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Management**: Use unique test data for each test
3. **Error Handling**: Implement robust error handling
4. **Performance**: Optimize test execution time
5. **Maintainability**: Keep code clean and well-documented

## 🔄 CI/CD Integration

The framework is optimized for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run install:browsers
    npm test
  env:
    GOOGLE_EMAIL: ${{ secrets.GOOGLE_EMAIL }}
    GOOGLE_PASSWORD: ${{ secrets.GOOGLE_PASSWORD }}
```

## 📄 License

MIT License - see LICENSE file for details. 