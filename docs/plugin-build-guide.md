# BackChannel Plugin Build Guide

This document provides information on how to build, test, and integrate the BackChannel plugin into your projects.

## Overview

The BackChannel plugin is built as a single JavaScript file that can be included in any web page via a script tag. The build process uses Vite to bundle all necessary dependencies into a single file with source maps for debugging.

## Build Configuration

The build process is configured in `vite.config.ts` with the following key features:

- Output format: IIFE (Immediately Invoked Function Expression)
- Output file: `dist/backchannel.js`
- Source maps: Enabled
- Minification: Disabled (for readability)
- Global name: `BackChannel`

## Building the Plugin

To build the plugin, run:

```bash
yarn build-plugin
```

This will generate the following files in the `dist` directory:
- `backchannel.js` - The main plugin file to be included in your web pages
- `backchannel.js.map` - Source map file for debugging

## Testing

### Automated Tests

The plugin build process is tested using Vitest. Tests verify that:
- The build output files exist
- The plugin exposes the expected API
- Source maps are correctly referenced

To run the tests:

```bash
yarn test
```

### Manual Testing

A test HTML page is provided at `test/plugin-test.html` to manually verify the plugin functionality. To test:

1. Build the plugin: `yarn build-plugin`
2. Start a development server: `yarn dev`
3. Open the test page in your browser
4. Click the "Initialize Plugin" button to test the plugin functionality

## Integration

To integrate the BackChannel plugin into your project:

1. Copy the `dist/backchannel.js` file to your project
2. Include it in your HTML with a script tag:
   ```html
   <script src="path/to/backchannel.js"></script>
   ```
3. Initialize the plugin:
   ```javascript
   BackChannel.init({
     requireInitials: true,  // Whether to require user initials for comments
     storageKey: 'your-storage-key'  // localStorage key for storing comments
   });
   ```

## API Reference

The plugin exposes a global `BackChannel` object with the following method:

- `init(config)`: Initializes the plugin with the provided configuration
  - `config.requireInitials`: Boolean indicating whether user initials are required for comments
  - `config.storageKey`: String key used for storing comments in localStorage

## Development

To modify the plugin:

1. Edit the source files in the `src` directory
2. Run `yarn build-plugin` to rebuild
3. Test your changes using the test page or automated tests

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the plugin is properly loaded (the BackChannel global object should be available)
3. Ensure source maps are correctly loaded for debugging
4. Check that the initialization configuration is correct
