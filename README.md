# BackChannel

BackChannel is a lightweight plugin that brings structured review workflows to the disconnected web. Built for static HTML environments — including offline, secure, or air-gapped systems — it lets users capture, organize, and revisit feedback directly within the content they’re reviewing. Feedback is stored locally and can be exported as a human-readable CSV file, leaving it up to the user to transfer, process, or integrate responses however they choose. Whether you’re sharing documentation, training materials, or reference content offline, BackChannel gives you review tools for the disconnected web — with full control over how feedback moves.

## Development Setup

This project is set up with the following tools:

- **TypeScript**: Strongly typed JavaScript for better developer experience
- **Vite**: Fast, modern frontend build tool
- **ESLint**: Code linting for identifying and fixing code issues
- **Prettier**: Code formatting for consistent style

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   yarn
   ```
3. Start the development server:
   ```
   yarn dev
   ```

### Available Scripts

- `yarn dev`: Start the development server
- `yarn build`: Build the project for production
- `yarn build-plugin`: Build the single-file JavaScript plugin for script tag usage
- `yarn preview`: Preview the production build locally
- `yarn test`: Run tests to verify the build output
- `yarn lint`: Run ESLint to check for code issues
- `yarn lint:fix`: Run ESLint and automatically fix issues when possible
- `yarn format`: Format all source files using Prettier

## Plugin Build Process

BackChannel can be built as a single JavaScript file for easy integration into any web page. The build process creates a non-minified bundle with source maps that can be included via a script tag.

```html
<script src="path/to/backchannel.js"></script>
<script>
  BackChannel.init({
    requireInitials: true,
    storageKey: 'your-storage-key'
  });
</script>
```

For detailed information about the plugin build process, see [Plugin Build Guide](docs/plugin-build-guide.md).
