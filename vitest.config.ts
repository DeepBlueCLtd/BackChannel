import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include only unit tests
    include: ['tests/unit/**/*.test.{js,ts}'],
    // Environment for running tests
    environment: 'jsdom',
  },
})
