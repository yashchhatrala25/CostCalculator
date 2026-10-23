# KC Seller — E-Commerce Cost & Profit Calculator 🇮🇳

[![Live Demo](https://img.shields.io/badge/Live_Demo-kcseller.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://kcseller.netlify.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **A modern, high-precision financial calculator and pricing engine built for Indian e-commerce sellers on Amazon India, Flipkart, and Meesho.**

Accurately calculate net take-home profits, factor in complex marketplace deduction schedules (referral commissions, tiered closing fees, shipping, collection fees, and 18% GST on services), account for Courier RTOs vs Customer Returns, and export professional PDF cost sheets.

🌐 **Production Live App:** [https://kcseller.netlify.app/](https://kcseller.netlify.app/)

---

## 📌 Table of Contents

- [Why KC Seller?](#-why-kc-seller)
- [Key Features](#-key-features)
- [Supported Marketplaces](#-supported-marketplaces)
- [Calculation Engines & Formulas](#-calculation-engines--formulas)
  - [Mode A: Cost → Target Selling Price (Reverse Solver)](#mode-a-cost--target-selling-price-reverse-solver)
  - [Mode B: Selling Price → Net Profit (Forward Audit)](#mode-b-selling-price--net-profit-forward-audit)
  - [Returns & Courier RTO Loss Buffer](#returns--courier-rto-loss-buffer)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## 💡 Why KC Seller?

Selling on Indian e-commerce marketplaces involves multiple layers of fee deductions, reverse logistics costs, and tax obligations that often erode seller margins:

1. **GST on Listing Price vs Marketplace Services**: Products have standard GST (0%, 5%, 12%, 18%, 28%), while marketplace commissions and shipping fees incur an additional **18% GST on services**.
2. **Returns vs Courier RTO Discrepancy**: Undelivered Courier RTOs cost forward & reverse shipping, whereas Customer Returns incur return shipping plus product damage/refurbishment loss.
3. **Complex Multi-Fee Structures**: Referral commission, weight-based shipping, fixed closing fee brackets, and payment gateway charges all compound together.

**KC Seller** solves this by providing instantaneous, mathematically transparent margin calculations and reverse-pricing solving.

---

## ✨ Key Features

- **Multi-Marketplace Support**: Pre-configured fee structures tailored for **Amazon India**, **Flipkart**, and **Meesho**.
- **Category Commission Presets**: One-click fee presets for popular categories (Fashion & Apparel, Electronics & Mobiles, Home & Kitchen, Beauty, Footwear, etc.).
- **Dual Calculation Engines**:
  - **Mode A (Target Pricing)**: Input manufacturing/procurement cost and desired profit (₹ or % margin) to calculate the recommended selling price ($P$).
  - **Mode B (Net Profit Audit)**: Input customer listing price to calculate exact deductions, GST liability, take-home profit, and Return on Investment (ROI %).
- **Advanced Return & RTO Modeling**:
  - *Simple Mode*: Flat percentage or fixed ₹ buffer per order.
  - *Detailed Mode*: Differentiates between **Customer Return % & Loss** vs **Courier RTO % & Freight Loss**.
- **Interactive Visual Breakdown**:
  - Real-time proportional allocation bar (Net Profit vs Marketplace Fees vs Product & Packaging vs Taxes & Returns).
  - Expandable itemized deduction schedule with tooltips and clarity.
- **Seller Invoice & PDF Cost Sheet Generator**:
  - Client-side vector PDF generation using `jspdf`.
  - Captures Seller Store Name, GSTIN, Item Name, SKU, Invoice Number, and Order Date.
  - Generates branded, printable analytical cost sheets formatted in Indian Rupee notation (₹ / INR).
- **Glassmorphic Responsive Design**:
  - Custom dark theme with vibrant marketplace accent colors.
  - Desktop sticky summary sidebar & mobile-optimized drawer.

---

## 🏢 Supported Marketplaces

| Marketplace | Commission / Referral Fee | Fixed Closing Fee | Shipping / Logistics | Payment Gateway |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon India** | 2% – 38% (Category based) | ₹5 – ₹70 (Tiered) | Easy Ship (Local / Regional / National) | 2% Collection fee |
| **Flipkart** | 3% – 22% (Category based) | ₹5 – ₹45 (Tiered) | Ekart Logistics | 2% Collection fee |
| **Meesho** | **0% Commission** | **₹0 Closing fee** | National Shipping Fee | **0% Payment fee** |

*Note: All marketplace service fees (commission, closing, shipping, payment gateway) attract **18% GST on services** as per Indian tax laws.*

---

## 🧮 Calculation Engines & Formulas

### Mode A: Cost → Target Selling Price (Reverse Solver)

Given:
- Product Cost ($C$), Packaging ($C_{pack}$), Advertising ($C_{ad}$)
- GST Rate ($g$), Commission Rate ($r_{comm}$), Payment Gateway Rate ($r_{pay}$)
- Fixed Closing Fee ($F_{close}$), Shipping Fee ($F_{ship}$)
- Return Buffer ($B_{ret}$), Desired Profit ($Profit$)

The calculator solves the net customer selling price ($P$) where:

$$\text{Revenue Excluding Product GST} = \frac{P}{1 + g}$$

$$\text{Marketplace Fees Before Tax} = (P \times r_{comm}) + F_{close} + F_{ship} + (P \times r_{pay})$$

$$\text{GST on Marketplace Fees} = \text{Fees} \times 0.18$$

$$\text{Net Profit} = \frac{P}{1 + g} - \left(\text{Fees} \times 1.18\right) - C - C_{pack} - C_{ad} - B_{ret}$$

### Mode B: Selling Price → Net Profit (Forward Audit)

1. **GST Breakdown**:
   - $\text{Sales Excl. GST} = \frac{P}{1 + g}$
   - $\text{Product GST Liability} = P - \text{Sales Excl. GST}$
2. **Marketplace Deductions**:
   - $\text{Total Fees} = \text{Commission} + \text{Closing Fee} + \text{Shipping Fee} + \text{Payment Fee}$
   - $\text{Total Marketplace Cut (incl. 18% GST)} = \text{Total Fees} \times 1.18$
3. **Net Profit & Margins**:
   - $\text{Net Take-Home Profit} = \text{Sales Excl. GST} - \text{Total Marketplace Cut} - \text{Product Cost} - \text{Packaging} - \text{Ad Cost} - \text{Return Buffer}$
   - $\text{Net Profit Margin (\%)} = \left(\frac{\text{Net Profit}}{P}\right) \times 100$
   - $\text{ROI / Profit on Cost (\%)} = \left(\frac{\text{Net Profit}}{\text{Product Cost}}\right) \times 100$

### Returns & Courier RTO Loss Buffer

In Detailed Mode:
$$\text{Customer Return Buffer} = \frac{\text{Customer Return Rate (\%)}}{100} \times \text{Loss per Customer Return (₹)}$$
$$\text{Courier RTO Buffer} = \frac{\text{Courier RTO Rate (\%)}}{100} \times \text{Loss per Courier RTO (₹)}$$
$$\text{Total Return Buffer} = \text{Customer Return Buffer} + \text{Courier RTO Buffer}$$

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Language**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Deployment & Hosting**: [Netlify](https://www.netlify.com/)
- **Build Tool**: Next.js Turbopack

---

## 📂 Project Architecture

```text
cost-calculator/
├── public/                 # Static assets & SVG icons
├── src/
│   ├── app/
│   │   ├── globals.css     # Design system, CSS variables & animations
│   │   ├── layout.tsx      # Root HTML layout & SEO metadata
│   │   └── page.tsx        # Main application state orchestrator
│   ├── components/
│   │   ├── CalculatorForm.tsx     # Inputs: Modes, Product Cost, Fees, Returns & GST
│   │   ├── MarketplaceTabs.tsx    # Amazon, Flipkart, Meesho selector
│   │   ├── SellerDetailsForm.tsx  # Seller business, GSTIN, SKU & invoice inputs
│   │   └── SummaryCard.tsx        # Live calculation summary, visual bar & PDF trigger
│   └── lib/
│       ├── calculator.ts   # Core calculation engine, fee defaults & presets
│       ├── pdfGenerator.ts # Client-side branded PDF cost sheet generation
│       └── types.ts        # TypeScript interfaces and domain models
├── eslint.config.mjs       # ESLint 9 configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Scripts & project dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18.18 or later) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yashchhatrala25/CostCalculator.git
   cd CostCalculator/cost-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks & Production Build

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Create optimized production build
npm run build

# Start production server locally
npm run start
```

---

## 🌐 Production Deployment

The project is hosted and continuously deployed on Netlify:

- **Live URL**: [https://kcseller.netlify.app/](https://kcseller.netlify.app/)
- **Repository**: [https://github.com/yashchhatrala25/CostCalculator](https://github.com/yashchhatrala25/CostCalculator)

When deploying to Netlify:
- **Base directory**: `cost-calculator`
- **Build command**: `npm run build`
- **Publish directory**: `cost-calculator/.next` (or default for Next.js Netlify runtime)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
