const { defineConfig } = require("playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 180000,
  expect: {
    timeout: 30000,
  },
  use: {
    baseURL: "http://127.0.0.1:6080",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node server.js",
    url: "http://127.0.0.1:6080",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
