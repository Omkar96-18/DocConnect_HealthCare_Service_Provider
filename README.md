# DocConnect — Healthcare Service Provider Platform

<p align="center">
  <img src="screenshot/DocConnect_logo.png" alt="DocConnect Logo" width="180" />
</p>

<p align="center">
  <strong>A Modern, Unified Digital Healthcare Ecosystem Connecting Patients, Doctors, Assistants, and Medical Centers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Django-6.1-092E20?logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Django_REST_Framework-3.15-red?logo=django&logoColor=white" alt="DRF" />
  <img src="https://img.shields.io/badge/Django_Channels-WebSocket-green?logo=webrtc&logoColor=white" alt="Django Channels" />
  <img src="https://img.shields.io/badge/SimpleJWT-Authentication-blue" alt="JWT" />
  <img src="https://img.shields.io/badge/QR_Prescription-OpenCV%20%2F%20PyZbar-orange" alt="QR Prescription" />
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?logo=python&logoColor=white" alt="Python" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Visual Diagrams (Mermaid)](#-system-architecture--visual-diagrams)
  - [1. Use Case Diagram](#1-use-case-diagram)
  - [2. User Workflow Diagram](#2-user-workflow-diagram)
  - [3. Sequence Diagram (Consultation & Approval Flow)](#3-sequence-diagram-consultation--approval-flow)
  - [4. Class Diagram](#4-class-diagram)
  - [5. Entity-Relationship (ER) Diagram](#5-entity-relationship-er-diagram)
  - [6. Deployment Architecture Diagram](#6-deployment-architecture-diagram)
- [Application Screenshots](#-application-screenshots)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Getting Started](#-installation--getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Demo Accounts](#demo-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
- [License](#-license)

---

## 🌟 Overview

**DocConnect** is an enterprise-grade healthcare service platform designed to streamline clinical workflows, patient appointments, consultations, and digital prescription issuance. 

It implements a 4-role hierarchy (**Patient**, **Doctor**, **Assistant**, and **Admin**):
- **Patients** can find certified doctors, review clinic locations, request consultation access, book in-person or virtual appointments, securely message healthcare professionals, and receive digital QR-coded prescriptions.
- **Doctors** can manage their schedules, triage patient consultation requests, conduct consultations, manage appointments, and issue tamper-verifiable digital prescriptions.
- **Assistants** support doctors and medical centers by screening consultation requests, coordinating schedules, and validating prescription barcodes.
- **Admins** manage hospital centers, doctor assignments, and overall system telemetry.

---

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and security scopes for Patients, Doctors, Clinic Assistants, and System Administrators.
- **Doctor Discovery & Geo-Location:** Search medical specialists by specialization, consultation fees, and medical center locations.
- **Access Approval Workflow:** Flexible consultation request system where doctors can delegate request approvals to clinical assistants or manage them directly.
- **Real-Time Consultations:** WebSocket-based real-time chat powered by Django Channels and Daphne ASGI.
- **Appointment Scheduling:** Support for both in-person clinic visits and virtual appointments with status tracking (`pending`, `approved`, `completed`, `cancelled`).
- **Encrypted QR Digital Prescriptions:** Doctors generate prescriptions with diagnoses, medicines, dosages, and instructions; the system renders automated QR barcodes validated via computer vision (`OpenCV` and `PyZbar`).
- **Automated In-App Notifications:** Real-time feedback when appointments are confirmed, access requests are updated, or prescriptions are validated.

---

## 📐 System Architecture & Visual Diagrams

The following system design and workflow diagrams are rendered visually directly from our architectural specifications in [`logic/`](logic/).

### 1. Use Case Diagram
Highlights user interactions and permission boundaries across Admin, Doctor, Patient, and Assistant roles:

```mermaid
flowchart LR
    Admin["Admin"]
    Doctor["Doctor"]
    Patient["Patient"]
    Assistant["Assistant"]

    subgraph System["DocConnect Healthcare System"]
        UC1(["Manage Users"])
        UC2(["Manage Medical Centers"])
        UC3(["View Dashboard Statistics"])

        UC4(["Manage Doctor Profile"])
        UC5(["View Patient Access Requests"])
        UC6(["Approve or Reject Access"])
        UC7(["Manage Appointments"])
        UC8(["Create Prescriptions"])
        UC9(["Assign Assistant"])
        UC10(["Grant Assistant Permissions"])

        UC11(["Register and Login"])
        UC12(["Manage Patient Profile"])
        UC13(["Find Doctors"])
        UC14(["Request Consultation Access"])
        UC15(["Book Appointments"])
        UC16(["Exchange Messages"])
        UC17(["View Prescriptions"])
        UC18(["Receive Notifications"])

        UC19(["Review Patient Requests"])
        UC20(["Validate Prescription Barcode"])
        UC21(["View Clinical Assignment"])
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3

    Doctor --> UC4
    Doctor --> UC7
    Doctor --> UC8
    Doctor --> UC9
    Doctor --> UC10
    Doctor --> UC16
    Doctor --> UC18

    Patient --> UC11
    Patient --> UC12
    Patient --> UC13
    Patient --> UC14
    Patient --> UC15
    Patient --> UC16
    Patient --> UC17
    Patient --> UC18

    Assistant --> UC19
    Assistant --> UC6
    Assistant --> UC20
    Assistant --> UC21
    Assistant --> UC18

    UC14 -.-> UC5
    UC5 -.-> UC6
    UC8 -.-> UC17
```

---

### 2. User Workflow Diagram
End-to-end user journey from authentication and role routing to appointment booking, live messaging, and prescription verification:

```mermaid
flowchart TD
    Start([Start])
    Login["Open DocConnect"]
    Auth["Register or Login"]
    Validate{"Credentials valid?"}
    Role{"Identify user role"}

    Admin["Admin Dashboard"]
    Doctor["Doctor Dashboard"]
    Patient["Patient Dashboard"]
    Assistant["Assistant Dashboard"]

    AdminTasks["Manage Users<br/>Manage Medical Centers<br/>View Statistics"]

    DoctorTasks["Manage Profile<br/>Manage Appointments<br/>Manage Patients<br/>Create Prescriptions<br/>Assign Assistant"]

    PatientTasks["Update Profile<br/>Find Doctors<br/>Request Consultation<br/>Book Appointments<br/>View Prescriptions"]

    AssistantTasks["Review Access Requests<br/>Coordinate Appointments<br/>Validate Prescription Barcodes<br/>View Assignment"]

    Access{"Consultation access available?"}
    Request["Submit Access Request"]
    Review{"Assistant approval required?"}
    AssistantReview["Assistant Reviews Request"]
    DoctorReview["Doctor Handles Request"]
    Chat["Open Consultation Conversation"]
    Appointment["Manage Appointment"]
    Prescription["Issue or View Prescription"]
    Barcode{"Prescription requires validation?"}
    ValidateBarcode["Assistant Validates Barcode"]
    Notification["Receive Notifications"]
    End([Continue Using DocConnect])

    Start --> Login
    Login --> Auth
    Auth --> Validate
    Validate -- No --> Login
    Validate -- Yes --> Role

    Role --> Admin
    Role --> Doctor
    Role --> Patient
    Role --> Assistant

    Admin --> AdminTasks
    AdminTasks --> Notification

    Doctor --> DoctorTasks
    DoctorTasks --> Appointment
    Appointment --> Prescription

    Patient --> PatientTasks
    PatientTasks --> Access
    Access -- No --> Request
    Request --> Review
    Review -- Yes --> AssistantReview
    AssistantReview --> Chat
    Review -- No --> DoctorReview
    DoctorReview --> Chat
    Access -- Yes --> Chat

    Chat --> Appointment
    Prescription --> Barcode
    PatientTasks --> Prescription
    Barcode -- Yes --> ValidateBarcode
    Barcode -- No --> Notification
    ValidateBarcode --> Notification
    Appointment --> Notification
    Notification --> End

    Assistant --> AssistantTasks
    AssistantTasks --> AssistantReview
    AssistantTasks --> ValidateBarcode
```

---

### 3. Sequence Diagram (Consultation & Approval Flow)
The lifecycle of patient requests, assistant triage routing, automated notification dispatches, and conversation enablement:

```mermaid
sequenceDiagram
    actor Patient
    participant UI as React Frontend
    participant API as Django REST API
    participant DB as Database
    participant Assistant
    participant Doctor
    participant Notify as Notification Service

    Patient->>UI: Select doctor and request consultation
    UI->>API: POST /api/access/request/
    API->>API: Authenticate and check patient role
    API->>DB: Find doctor and existing access request
    DB-->>API: Doctor and request details

    alt Doctor has an assistant
        API->>DB: Create or update pending access request
        API->>Notify: Create assistant notification
        Notify->>DB: Save notification
        API-->>UI: Return pending access status
        UI-->>Patient: Show request awaiting review

        Assistant->>UI: Review patient request
        UI->>API: POST /api/access/approve/{access_id}/
        API->>API: Check assistant permission
        API->>DB: Update access request status

        alt Request approved
            API->>DB: Enable messaging and create conversation
            API->>Notify: Notify relevant user
            API-->>UI: Return approved status
            UI-->>Patient: Show consultation access granted
        else Request rejected
            API->>Notify: Notify relevant user
            API-->>UI: Return rejected status
            UI-->>Patient: Show request rejected
        end

    else Doctor has no assistant
        API->>DB: Create approved access record
        API->>DB: Create or retrieve conversation
        API->>Notify: Notify doctor
        API-->>UI: Return approved status
        UI-->>Patient: Show direct consultation access
    end
```

---

### 4. Class Diagram
Object-oriented domain structure depicting model classes, relations, methods, and access control associations:

```mermaid
classDiagram
    class CustomUser {
        +int id
        +string username
        +string email
        +string role
        +string phone
        +string address
        +float latitude
        +float longitude
    }

    class MedicalCenter {
        +int id
        +string name
        +string address
        +float latitude
        +float longitude
        +string phone
        +string email
    }

    class DoctorProfile {
        +int id
        +string specialization
        +int experience_years
        +decimal consultation_fee
        +string license_number
        +boolean is_accepting_patients
        +boolean assistant_can_approve
    }

    class AssistantProfile {
        +int id
        +int user_id
        +int medical_center_id
        +doctor()
    }

    class PatientProfile {
        +int id
        +date date_of_birth
        +string blood_group
        +text allergies
        +text medical_history
    }

    class DoctorPatientAccess {
        +int id
        +string status
        +boolean can_message
        +boolean assistant_permission_granted
    }

    class Appointment {
        +int id
        +string mode
        +string status
        +datetime scheduled_at
        +text notes
        +approve()
        +cancel()
    }

    class Conversation {
        +int id
        +boolean is_active
        +datetime created_at
    }

    class Message {
        +int id
        +text content
        +boolean is_read
        +datetime created_at
    }

    class Prescription {
        +UUID id
        +json medicines
        +text diagnosis
        +string barcode_data
        +boolean is_validated
        +datetime validated_at
    }

    class Notification {
        +int id
        +string title
        +text body
        +string notif_type
        +boolean is_read
    }

    CustomUser "1" --> "0..1" DoctorProfile : profile
    CustomUser "1" --> "0..1" PatientProfile : profile
    CustomUser "1" --> "0..1" AssistantProfile : profile

    MedicalCenter "0..1" --> "0..*" DoctorProfile : employs
    MedicalCenter "0..1" --> "0..*" AssistantProfile : accommodates
    AssistantProfile "0..1" --> "0..*" DoctorProfile : assists

    DoctorProfile "1" --> "*" DoctorPatientAccess : access requests
    CustomUser "1" --> "*" DoctorPatientAccess : patient
    DoctorProfile "1" --> "*" Appointment : appointments
    CustomUser "1" --> "*" Appointment : books
    AssistantProfile "0..1" --> "*" Appointment : coordinates

    DoctorProfile "1" --> "*" Conversation : conversations
    CustomUser "1" --> "*" Conversation : patient
    Conversation "1" --> "*" Message : messages
    CustomUser "1" --> "*" Message : sender

    DoctorProfile "1" --> "*" Prescription : issues
    CustomUser "1" --> "*" Prescription : receives
    Appointment "0..1" --> "*" Prescription : associated

    CustomUser "1" --> "*" Notification : receives
    CustomUser "0..1" --> "*" Prescription : validates
```

---

### 5. Entity-Relationship (ER) Diagram
Detailed relational schema of the database including foreign keys, cardinality, and data types:

```mermaid
erDiagram
    CUSTOM_USER {
        int id PK
        string username
        string email
        string password
        string role
        string first_name
        string last_name
        string phone
        string address
        float latitude
        float longitude
        string profile_pic
    }

    MEDICAL_CENTER {
        int id PK
        string name
        string address
        float latitude
        float longitude
        string phone
        string email
        datetime created_at
        datetime updated_at
    }

    DOCTOR_PROFILE {
        int id PK
        int user_id FK
        int medical_center_id FK
        int assistant_id FK
        string specialization
        int experience_years
        decimal consultation_fee
        string license_number
        json available_days
        time available_from
        time available_to
        boolean is_accepting_patients
        boolean assistant_can_approve
    }

    ASSISTANT_PROFILE {
        int id PK
        int user_id FK
        int medical_center_id FK
    }

    PATIENT_PROFILE {
        int id PK
        int user_id FK
        date date_of_birth
        string blood_group
        text allergies
        text medical_history
        string emergency_contact_name
        string emergency_contact_phone
    }

    DOCTOR_PATIENT_ACCESS {
        int id PK
        int doctor_id FK
        int patient_id FK
        string status
        int approved_by_id FK
        boolean can_message
        boolean assistant_permission_granted
        datetime created_at
        datetime updated_at
    }

    APPOINTMENT {
        int id PK
        int doctor_id FK
        int patient_id FK
        int assistant_id FK
        string mode
        string status
        datetime scheduled_at
        text notes
        text patient_notes
        boolean approved_by_assistant
        datetime approved_at
        datetime created_at
        datetime updated_at
    }

    CONVERSATION {
        int id PK
        int doctor_id FK
        int patient_id FK
        boolean is_active
        datetime created_at
    }

    MESSAGE {
        int id PK
        int conversation_id FK
        int sender_id FK
        text content
        boolean is_read
        datetime created_at
    }

    PRESCRIPTION {
        uuid id PK
        int doctor_id FK
        int patient_id FK
        int appointment_id FK
        json medicines
        text diagnosis
        text notes
        string barcode_data
        string barcode_image
        boolean is_validated
        int validated_by_id FK
        datetime validated_at
        datetime created_at
    }

    NOTIFICATION {
        int id PK
        int user_id FK
        string title
        text body
        string notif_type
        boolean is_read
        datetime created_at
    }

    CUSTOM_USER ||--o| DOCTOR_PROFILE : has
    CUSTOM_USER ||--o| PATIENT_PROFILE : has
    CUSTOM_USER ||--o| ASSISTANT_PROFILE : has

    MEDICAL_CENTER o|--o{ DOCTOR_PROFILE : employs
    MEDICAL_CENTER o|--o{ ASSISTANT_PROFILE : accommodates
    ASSISTANT_PROFILE o|--o{ DOCTOR_PROFILE : assists

    DOCTOR_PROFILE ||--o{ DOCTOR_PATIENT_ACCESS : manages
    CUSTOM_USER ||--o{ DOCTOR_PATIENT_ACCESS : requests
    CUSTOM_USER o|--o{ DOCTOR_PATIENT_ACCESS : approves

    DOCTOR_PROFILE ||--o{ APPOINTMENT : receives
    CUSTOM_USER ||--o{ APPOINTMENT : books
    ASSISTANT_PROFILE o|--o{ APPOINTMENT : coordinates

    DOCTOR_PROFILE ||--o{ CONVERSATION : participates
    CUSTOM_USER ||--o{ CONVERSATION : participates
    CONVERSATION ||--o{ MESSAGE : contains
    CUSTOM_USER ||--o{ MESSAGE : sends

    DOCTOR_PROFILE ||--o{ PRESCRIPTION : issues
    CUSTOM_USER ||--o{ PRESCRIPTION : receives
    APPOINTMENT o|--o{ PRESCRIPTION : relates_to
    CUSTOM_USER o|--o{ PRESCRIPTION : validates

    CUSTOM_USER ||--o{ NOTIFICATION : receives
```

---

### 6. Deployment Architecture Diagram
Complete multi-tier client, ASGI server, WebSocket consumer, and storage topology:

```mermaid
flowchart TB
    User["Admin / Doctor / Patient / Assistant"]

    subgraph Client["Client Device"]
        Browser["Web Browser"]
        React["React Application"]
        Router["React Router"]
        Axios["Axios API Client"]
    end

    subgraph Server["Backend Server"]
        Django["Django Application"]
        DRF["Django REST Framework"]
        JWT["JWT Authentication"]
        ASGI["ASGI Application"]
        Channels["Django Channels"]
        Consumer["Chat WebSocket Consumer"]
        Media["Media Storage<br/>QR and profile images"]
    end

    subgraph Data["Persistence Layer"]
        DB[("Django Database<br/>Configured Database")]
        ChannelLayer[("Channel Layer<br/>Configured Backend")]
    end

    User --> Browser
    Browser --> React
    React --> Router
    React --> Axios

    Axios -->|"HTTPS / REST API"| DRF
    DRF --> Django
    DRF --> JWT
    Django --> DB
    Django --> Media

    React -->|"WebSocket with JWT"| ASGI
    ASGI --> Channels
    Channels --> Consumer
    Consumer --> DB
    Consumer <--> ChannelLayer
```

---

## 📸 Application Screenshots

### Authentication & Onboarding
Seamless onboarding with role selection, clean validation, and persistent JWT authentication:

| Login Portal | Registration Portal |
| :---: | :---: |
| ![Login Page](screenshot/LoginPage.png) | ![Signup Page](screenshot/SignupPage.png) |

---

### Doctor Workspace & Clinical Dashboard
Comprehensive dashboard with appointment summaries, pending approvals, quick actions, and revenue metrics:

![Doctor Dashboard](screenshot/DoctorDashboard.png)

---

### Appointment Management
Manage appointment calendars, consultation modes (In-person / Online), patient medical notes, and status workflows:

![Doctor Appointments](screenshot/DoctorAppoiments.png)

---

### Secure Digital Prescription with QR Code
Automated digital prescription generation featuring medicine regimen tables, dosages, diagnostic notes, and automated QR verification code:

![QR Prescription](screenshot/QRPRescription.png)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Bundler & Build Tool:** [Vite 8](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons & UI Feedback:** [Lucide React](https://lucide.dev/), [React Hot Toast](https://react-hot-toast.com/)
- **Token Management:** `jwt-decode`

### Backend
- **Core Framework:** [Django 6.1+](https://www.djangoproject.com/)
- **API Engine:** [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- **Real-Time Communication:** [Django Channels 4](https://channels.readthedocs.io/) & [Daphne ASGI](https://github.com/django/daphne)
- **Authentication:** [Django REST Framework SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- **Barcode & QR Vision:** [OpenCV](https://opencv.org/), [PyZbar](https://pypi.org/project/pyzbar/), [qrcode](https://pypi.org/project/qrcode/)
- **Database:** SQLite (default for development) / PostgreSQL ready

---

## 📁 Project Directory Structure

```plaintext
DocConnect_HealthCare_Service_Provider/
├── backend/                        # Django backend application
│   ├── api/                        # Core API app (models, views, serializers, urls)
│   │   ├── admin.py
│   │   ├── consumers.py            # WebSocket consumer for real-time messaging
│   │   ├── models.py               # Database schemas & custom user models
│   │   ├── routing.py              # WebSocket routing definition
│   │   ├── serializers.py          # DRF model serializers
│   │   ├── urls.py                 # REST API routes
│   │   └── views.py                # Business logic, QR generation & verification
│   ├── core/                       # Django project configuration & ASGI/WSGI
│   │   ├── asgi.py                 # ASGI configuration for HTTP + WebSockets
│   │   ├── settings.py
│   │   └── urls.py
│   ├── media/                      # Uploaded media & generated QR codes
│   ├── manage.py
│   ├── pyproject.toml              # Python dependencies & metadata
│   └── seed_demo_data.py           # Database seeder with sample doctors, patients & rx
├── frontend/                       # React + Vite frontend application
│   ├── src/
│   │   ├── api/                    # Axios clients & API request helpers
│   │   ├── components/             # Reusable UI components & layouts
│   │   ├── context/                # Authentication & state context providers
│   │   ├── pages/                  # Route views (Login, Register, Dashboards, Appointments)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json                # Frontend dependencies & scripts
│   └── vite.config.js
├── logic/                          # Architecture & design specifications (.mermaid)
│   ├── class_digram.mermaid        # Domain model class diagram
│   ├── deployment_digram.mermaid   # Infrastructure & deployment topology
│   ├── ER_digram.mermaid           # Entity-relationship data schema
│   ├── swqunces_digram.mermaid     # Consultation sequence diagram
│   ├── usecase_digram.mermaid      # System use cases diagram
│   └── user_worfollow.mermaid      # User lifecycle flowchart
├── screenshot/                     # Project screenshots & visual branding
│   ├── DocConnect_logo.png
│   ├── DoctorAppoiments.png
│   ├── DoctorDashboard.png
│   ├── LoginPage.png
│   ├── QRPRescription.png
│   └── SignupPage.png
└── README.md                       # Main documentation & architecture guide
```

---

## ⚡ Installation & Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher) & `npm`
- **Python** (v3.12 or higher)
- **Git**

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # On Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # On Linux/macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers channels daphne qrcode pillow opencv-python pyzbar cryptography
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Seed demo data (Creates sample doctors, assistant, patient, appointments & prescriptions):**
   ```bash
   python seed_demo_data.py
   ```

6. **Start the ASGI development server:**
   ```bash
   python manage.py runserver
   ```
   > Backend server will be accessible at: `http://127.0.0.1:8000/`

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install node dependencies:**
   ```bash
   npm install
   ```

3. **Launch the Vite development server:**
   ```bash
   npm run dev
   ```
   > Frontend application will be live at: `http://localhost:5173/`

---

### 🔑 Demo Accounts

Use the pre-seeded demo accounts to test various roles immediately:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full superuser access to admin dashboard & center settings |
| **Doctor** | `dr_sharma` | `doctor123` | Cardiologist at City Health Hospital (Assisted by Priya) |
| **Doctor** | `dr_patel` | `doctor123` | General Physician at Metro Care Clinic (Direct access) |
| **Assistant**| `assistant_priya` | `assistant123` | Assistant assigned to Dr. Sharma & City Health Hospital |
| **Patient** | `patient_rahul` | `patient123` | Patient Rahul Kumar with active consultations & prescriptions |

---

## 📡 API Endpoints Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register/` | Register a new user (`patient`, `doctor`, `assistant`) |
| **Auth** | `POST` | `/api/auth/login/` | Obtain JWT token pair (`access`, `refresh`) |
| **Auth** | `GET` | `/api/auth/profile/` | Retrieve authenticated user profile |
| **Doctors** | `GET` | `/api/doctors/` | Search & list active doctors with medical center info |
| **Access** | `POST` | `/api/access/request/` | Submit consultation access request to a doctor |
| **Access** | `POST` | `/api/access/approve/<id>/` | Doctor/Assistant approve or reject access request |
| **Appointments** | `GET`, `POST`| `/api/appointments/` | Retrieve or schedule patient appointments |
| **Appointments** | `PATCH` | `/api/appointments/<id>/` | Update appointment status (`approved`, `completed`, etc.) |
| **Prescriptions**| `GET`, `POST`| `/api/prescriptions/` | Create or fetch digital prescriptions with QR code |
| **Prescriptions**| `POST` | `/api/prescriptions/validate/` | Validate scanned barcode or upload QR code image |
| **WebSocket** | `WS` | `/ws/chat/<conv_id>/?token=<jwt>`| Real-time consultation chat stream |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
