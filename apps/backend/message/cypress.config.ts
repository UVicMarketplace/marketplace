import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // baseUrl: "http://localhost:8214",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
  },
});
