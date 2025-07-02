# BackChannel Testing Standards

## Test Organization

BackChannel uses two types of tests:
1. **Unit Tests** - For testing individual components and functions
2. **Integration Tests** - For testing interactions between components and end-to-end functionality using Playwright

### Directory Structure

```
/BackChannel
├── src/                 # Source code
├── tests/               # Unit tests using Vitest
│   └── e2e/             # Integration/E2E tests using Playwright
│       ├── specs/           # Test specifications
│       │   ├── db-service.spec.js
│       │   └── ui.spec.js
│       ├── fixtures/        # Test fixtures and data
│       │   └── db-test.html
│       └── utils/           # Test utilities
│   └── unit/            # All unit tests go here
│       ├── services/    # Tests for service modules
│       ├── ui/          # Tests for UI components
│       └── utils/       # Tests for utility functions
└── vitest.config.ts     # Vitest configuration
└── playwright.config.js # Playwright configuration
```

### File Naming Conventions

1. **Unit Tests**:
   - Named with `.test.js` or `.test.ts` suffix
   - Example: `storage.test.ts` for testing `storage.ts`

2. **Integration Tests**:
   - Named with `.spec.js` or `.spec.ts` suffix
   - Example: `db-service.spec.js` for testing database service integration

### Configuration Files

- `vitest.config.ts` - Configures unit tests
- `playwright.config.js` - Configures integration tests

## Running Tests

- `yarn test` - Run unit tests only
- `yarn test:integration` - Run integration tests only
- `yarn test:all` - Run all tests
