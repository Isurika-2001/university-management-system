# University Management System: Phase 1 Proposal

This document outlines the functionality provided in the first phase of the University Management System and includes a cost breakdown for the development work.

---

## 1. Functionality Breakdown

The system is a comprehensive web-based application designed to manage students, courses, and academic operations. It consists of a frontend user interface and a backend server that handles business logic and data persistence.

### Core Modules & Features:

**A. User & Access Management**
- **Authentication:** Secure user login with credential validation.
- **User Management:** Ability to create, view, update, and deactivate user accounts (for staff like admins, counselors, etc.).
- **Role-Based Access Control (RBAC):** A permission system that restricts access to features based on user roles (e.g., only an Admin can delete a course).

**B. Student Lifecycle Management**
- **Student Profiles:** A central record for each student with personal details, contact information, and academic status.
- **CRUD Operations:** Full capabilities to create, read, update, and delete student records.
- **Bulk Operations:**
    - **Export:** Export student lists and data to Excel for reporting and offline use.
- **Status Tracking:** Update and maintain student status (e.g., Active, Dropped Out, Graduated).

**C. Academic Structure Management**
- **Course Management:** Define and manage courses offered by the university, including course names, codes, and descriptions.
- **Module Management:** Create and manage modules (subjects) that belong to specific courses.
- **Batch Management:** Create and organize student batches for specific intake years and courses.
- **Classroom Management:** Define and manage physical or virtual classrooms.

**D. Enrollment & Academic Progress**
- **Student Enrollment:** Enroll students into specific courses and batches.
- **Enrollment History:** View the complete history of a student's enrollments, including course changes and classroom assignments.
- **Batch Transfers:** Functionality to formally transfer a student from one batch to another, with a recorded history of the transfer.

**E. Examinations & Records**
- **Exam Management:** Schedule and manage examinations for different courses and modules.
- **Required Documents:** Track and manage mandatory documents required from students upon enrollment (e.g., birth certificate, previous qualifications).

**F. System Administration & Auditing**
- **Dashboard & Statistics:** A central dashboard providing key statistics and an overview of the system's data.
- **Activity Logging:** The system logs important user actions to provide an audit trail for accountability and security.

---

## 2. Invoice & Cost Breakdown

**To:** BIET | British Institute of Engineering & Technology
**From:** Concord Tech Solutions
**Date:** December 30, 2025
**Project:** University Management System - Phase 1 Development

### Cost Summary

*   **Estimated Hourly Rate:** 4,000.00 LKR
*   **Total Estimated Hours:** 380 hours
*   **Total Estimated Cost:** **1,520,000.00 LKR**

### Detailed Cost Breakdown

| Feature Module                  | Description                                                                                              | --------------- | --------------- |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- | --------------- |
| **1. Backend Development**      |                                                                                                          | **160**         | **640,000.00**  |
| - API & Database Design         | Setup database schemas, design and implement all API endpoints for core logic.                           | 80              | 320,000.00      |
| - Authentication & Permissions  | Implement secure login, user sessions, and the role-based access control system.                         | 40              | 160,000.00      |
| - Business Logic Implementation | Develop logic for student management, enrollments, and batch transfers.                                  | 40              | 160,000.00      |
| **2. Frontend Development**     |                                                                                                          | **160**         | **640,000.00**  |
| - UI/UX Implementation          | Develop all user interface pages, components, and forms for the features listed above.                   | 80              | 320,000.00      |
| - API Integration               | Connect the frontend to the backend API to enable data flow and user interactions.                       | 50              | 200,000.00      |
| - State Management & Routing    | Implement application-wide state management and navigation.                                              | 30              | 120,000.00      |
| **3. Testing & Quality Assurance** |                                                                                                          | **40**          | **160,000.00**  |
| - Unit & Integration Testing    | Write tests for both backend and frontend to ensure reliability and catch bugs early.                     | 25              | 100,000.00      |
| - Manual & User Acceptance Testing | Perform end-to-end testing of all user flows.                                                          | 15              | 60,000.00       |
| **4. Project Management**       |                                                                                                          | **20**          | **80,000.00**   |
| - Planning & Communication      | Project planning, regular status meetings, and client communication.                                     | 20              | 80,000.00       |
| **TOTAL**                       |                                                                                                          | **380**         | **1,520,000.00**|

---
### Terms

*   This is an estimate for Phase 1. Additional features or changes will be quoted separately.
*   Payment to be made in installments as per the project agreement.
*   All prices are in Sri Lankan Rupees (LKR).

Thank you for your business!
