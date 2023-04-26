// @ts-check
const { defineConfig, devices } = require('@playwright/test')
const CONSTANTS = require('./data/constants')

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config()

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'erp-worklog',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: CONSTANTS.ERP_URL,
        ignoreHTTPSErrors: true,
      },
      testMatch: 'erp-worklog.test.js',
    },
    {
      name: 'mailslurp-pg',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: CONSTANTS.MAILSLURP_PG_URL,
        testIdAttribute: 'data-test',
      },
      testMatch: 'mailslurp-pg.test.js',
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
})
