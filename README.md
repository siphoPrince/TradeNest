# Cylo - Secure Social Commerce Marketplace

Cylo is a modern, security-focused social commerce marketplace application designed to protect buyers and sellers from fraud and scams. By blending the interactive element of social selling with robust transactional security, Cylo ensures that physical handovers and digital transactions are 100% reliable.

The project is hosted in this repository alongside its automated testing suite, showcasing clean full-stack architecture and comprehensive quality assurance.

---

## Core Features

### Specialized Face-to-Face Escrow
Traditional online marketplaces carry massive risks of scams during physical meetups. Cylo eliminates this with a customized, physical escrow structure:
* **TradeSafe Escrow Integration:** Funds are securely held in escrow within our C# backend logic upon purchase, preventing payment default or immediate seller fraud.
* **The Handshake Workflow:** 
  1. Buyer and seller arrange to meet up.
  2. During the physical handover, the seller initiates the handover step inside the application.
  3. Once the buyer physically inspects and receives the item, they confirm receipt in-app.
  4. Funds are instantly released from the escrow hold to the seller.

### Responsive Social Commerce Interface
* A dynamic, highly polished mobile-responsive UI designed to facilitate social discoveries, communication, and simple product listings.
* Direct messaging and coordination built natively into the commerce experience.

---

## Technical Stack & Architecture

The application is built utilizing enterprise-grade, modern web development patterns:

* **Frontend:** React, TailwindCSS, and highly responsive mobile-first UI components.
* **Backend:** Node.js, C#, and ASP.NET Core controllers managing secure transaction logic, webhooks, and state changes.
* **Database & ORM:** SQL Server managed with Entity Framework, utilizing clean production schema migrations.
* **Integrations:** Direct API and webhook integrations with TradeSafe escrow facilities.
* **E2E Automation:** A robust end-to-end testing suite written in Playwright using the Page Object Model (POM) pattern, automated using GitHub Actions.

---

## Project Structure

```text
├── tests/                  # Playwright E2E Test Automation Suite
│   ├── pages/              # Page Object Model (POM) classes (e.g., LoginPage.js)
│   ├── fixtures/           # Static test data, expected messages, and system paths
│   └── tests/              # E2E spec files (e.g., login.spec.js)
├── [backend/frontend/etc]  # Core Cylo Application Code
```

---

## Future Roadmap
* **Advanced Geolocation Matchmaking:** Helping buyers and sellers find secure local exchange zones.
* **Expanded Payment Channels:** Rolling out additional regional payment processing layers tailored for South African merchants.
* **Automated Regression Pipelines:** Continual expansion of the Playwright E2E suite to cover every core escrow transaction branch.
