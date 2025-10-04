# Expense Management System

A modern **Expense Management System** designed to simplify expense reimbursement processes for
companies. This system reduces manual effort, improves transparency, and supports multi-level,
conditional approvals.

---

## Table of Contents

-   [Features](#features)
-   [User Roles & Permissions](#user-roles--permissions)
-   [Approval Workflow](#approval-workflow)
-   [Conditional Approval Flow](#conditional-approval-flow)
-   [OCR Integration](#ocr-integration)
-   [APIs Used](#apis-used)
-   [Tech Stack](#tech-stack)
-   [Setup & Installation](#setup--installation)
-   [Usage](#usage)
-   [Screenshots / Mockups](#screenshots--mockups)
-   [License](#license)

---

## Features

-   **Authentication & User Management**

    -   Auto-create company and admin on first signup
    -   Create Employees & Managers
    -   Assign and change roles: Employee, Manager
    -   Define manager relationships for employees

-   **Expense Submission (Employee Role)**

    -   Submit expense claims with: Amount (different currencies supported), Category, Description,
        Date
    -   View expense history (Approved, Rejected, Pending)

-   **Approval Workflow (Manager/Admin Role)**

    -   Multi-step approval process
    -   Approvers can approve/reject expenses with comments
    -   Admin can define approval sequences when multiple approvers exist
    -   Expense moves to next approver only after current approval

-   **Conditional Approval Flow**

    -   **Percentage rule**: e.g., 60% of approvers approve → Expense approved
    -   **Specific approver rule**: e.g., If CFO approves → Auto-approved
    -   **Hybrid rule**: Combines both percentage and specific approver rules
    -   Supports multiple approvers + conditional rules simultaneously

-   **Role Permissions**

    -   **Admin:** Manage users, roles, approval rules, view all expenses, override approvals
    -   **Manager:** Approve/reject expenses, view team expenses, escalate per rules
    -   **Employee:** Submit expenses, view personal expense status

-   **Additional Features**
    -   **OCR for receipts:** Auto-read receipts to extract amount, date, description, type, and
        vendor
    -   **Multi-currency support:** Uses external APIs for currency conversion

---

## OCR Integration

Employees can simply scan receipts. The system uses OCR to auto-generate expense entries with:

-   Amount
-   Date
-   Description
-   Expense lines
-   Expense type
-   Vendor / Merchant name

---

## APIs Used

-   **Country & Currency Data:**  
    `https://restcountries.com/v3.1/all?fields=name,currencies`

-   **Currency Conversion:**  
    `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

---

## Tech Stack

-   **Frontend:** React, Tailwind CSS, PrimeReact (optional)
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **OCR:** Tesseract.js (or any preferred OCR library)
-   **Other:** REST APIs for currency data & conversions

---

## Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/expense-management.git
cd expense-management
```

### Registration:

![register](client-web/src/assets/register.png)

### Login:

![login](client-web/src/assets/login.png)

### Admin:

### Dashboard:

![dashboard](client-web/src/assets/AdminDash.png)

### Users:

![users](client-web/src/assets/users.png)

### Add User:

![add-user](client-web/src/assets/addUser.png)

### Create Approval Rules:

![rules](client-web/src/assets/rules.png)

### Manager:

### Dashbaord:

![dashbaord](client-web/src/assets/managerDash.png)

### Approvals to Review:

![approvals](client-web/src/assets/approvals.png)

### View Expense Details:

![submit-expense](client-web/src/assets/details.png)

### Response to Approvals:

![approvals](client-web/src/assets/ResponseToApproval.png)

### Change Password in Profile:

![submit-expense](<client-web/src/assets/profile (2).png>)

### Employee:

![dashbaord](client-web/src/assets/emploDash.png)

### Submit Expense:

![submit-expense](client-web/src/assets/submit.png)

### Expense History:

![expense-history](client-web/src/assets/history.png)

### Expense Tracking:

![expense-history](client-web/src/assets/tracking.png)

### Submit Expense by OCR:

![submit-expense-by-ocr](client-web/src/assets/submitOCR.png)
