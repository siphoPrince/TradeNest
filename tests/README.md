# Cylo - End-to-End Test Automation Suite

This repository houses the automated End-to-End (E2E) test suite for the **Cylo** web application. Built using **Playwright** and **JavaScript**, the suite is designed to ensure the reliability, security, and smooth execution of critical user flows, starting with authentication.

## Tech Stack & Architecture

- **Test Runner:** Playwright
- **Design Pattern:** Page Object Model (POM) for clean separation of test logic and page-specific selectors/actions.
- **Environment Management:** Dotenv for securing sensitive test credentials and dynamic URL targeting.

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siphoPrince/TradeNest/
   cd tests
   npm install
   npx playwright install

### Environment Setup

1. **Create a .env file in the root directory (use .env.example as a template) and populate it with your test configurations:**
   ```bash
   BASE_URL=http://localhost:3000
   TEST_USER_ValidEMAIL=your_valid_test_email@example.com
   TEST_USER_ValidPASS=your_secure_password
   TEST_USER_InvalidEMAIL=invalid@example.com
   TEST_USER_InvalidPASS=short

### RUNNING THE TESTS

1. **You can execute the test suite in several modes depending on your workflow:**
   ```bash
   1. Run all tests in headless mode (Command Line):
      npm run test

   2. Run tests in interactive UI Mode (Highly Recommended for Debugging):
      npm run test:ui

   3. View HTML Test Reports:
      npx playwright show-report


### PROJECT STRUCTURE HIGHLIGHTS
* pages/: Contains the Page Object classes ( LoginPage.js). These class files encapsulate page-specific selectors and interactions, making tests highly reusable and easy to maintain.
* fixtures/: Houses static test data, system paths, and expected error messages to avoid hardcoding strings directly inside test files.
* tests/: Contains the actual test specifications (e.g., login.spec.js) organized by feature domains.
