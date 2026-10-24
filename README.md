# Veer Parivaar

Veer Parivaar is a digital welfare platform concept designed to help defence families submit support requests, manage basic family profiles, and coordinate assistance through administrators and volunteers.

> **Project status:** V1 is a working development release. It is not an official Indian Armed Forces service and has not been approved for real defence or sensitive personal data.

## V1 Features

- **Role-based access:** Family Member, Admin, and Volunteer roles with JWT authentication.
- **Family profiles:** Create and view a basic family profile.
- **Support requests:** Families can submit and track requests.
- **Volunteer assignment:** Admins can assign requests to volunteers.
- **Request workflow:** Requests move through supported statuses such as `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, and `REJECTED`.
- **Document handling:** Upload and download supported PDF, PNG, and JPEG files up to 5 MB, with access checks.
- **Role-specific dashboards:** Separate dashboards for family members, administrators, and volunteers.

## Technology Stack

**Backend**
- Java 17 and Spring Boot
- Spring Security, Spring Data JPA, and Spring Web
- MySQL for local application data
- H2 for automated tests
- Maven Wrapper
- JWT authentication

**Frontend**
- React and Vite
- JavaScript and Tailwind CSS
- React Router
- Lucide React icons
- Oxlint

## Project Structure

```text
veer-parivaar-backend/          # Workspace root
├── README.md
├── veer-parivaar-backend/      # Spring Boot API
│   ├── pom.xml
│   └── src/
└── veer-parivaar-frontend/     # React + Vite app
    ├── package.json
    └── src/
```

## Prerequisites

Install the following before running the project:

- Java JDK 17 or later
- Node.js and npm
- MySQL 8 or later

Check installations with `java -version`, `node -v`, `npm -v`, and `mysql --version`.

## Local Setup

### 1. Create the database

Start MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS veer_parivaar;
```

The backend uses Hibernate's `ddl-auto=update` setting to update the schema when it starts. For important data, use proper database backups and migrations rather than relying on this setting alone.

### 2. Start the backend

Open PowerShell in the workspace root and run:

```powershell
cd .\veer-parivaar-backend
$env:DB_PASSWORD = Read-Host "Enter your MySQL password"
```

Generate a temporary random JWT secret for local development:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Then start Spring Boot:

```powershell
.\mvnw.cmd spring-boot:run
```

Keep this terminal open. The backend runs at `http://localhost:8080` when startup succeeds.

**Note:** Restarting with a new JWT secret invalidates tokens created with the previous secret. Sign in again after restarting.

### 3. Start the frontend

Open a second terminal in the workspace root:

```powershell
cd .\veer-parivaar-frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Environment Configuration

The backend reads these environment variables:

- `DB_PASSWORD` — password for the local MySQL account.
- `JWT_SECRET` — secret used to sign JWTs; use a strong, randomly generated value.
- `UPLOAD_DIR` — optional absolute directory for uploaded files. If unset, the application uses `${user.home}/.veer-parivaar/uploads`.

Set these values in your terminal or deployment environment. **Never place real credentials, tokens, or secrets in this README or commit them to Git.**

## Main API Routes

All API routes use the `/api` prefix. The frontend development server proxies API requests to the backend.

**Public**
- `POST /api/auth/register` — register a family-member account.
- `POST /api/auth/login` — sign in and receive a JWT.
- `GET /api/resources` — retrieve public resources.

**Family Member**
- `GET` and `POST /api/family-profile` — view or create the current user's profile.
- `GET` and `POST /api/support-requests` — list or create support requests.
- `GET /api/support-requests/{id}` — view a request the user is permitted to access.
- `POST /api/documents/upload` — upload a supported document.
- `GET /api/documents` — list the user's documents.
- `GET /api/documents/{id}/download` — download an authorized document.

**Admin**
- `GET /api/admin/support-requests` — view support requests.
- `POST /api/admin/support-requests/{id}/assign` — assign a request to a volunteer.

**Admin and Volunteer**
- `GET /api/staff/support-requests` — retrieve requests available to the signed-in staff member.
- `GET /api/staff/support-requests/{id}` — view an accessible assigned request.
- `PATCH /api/staff/support-requests/{id}/status` — update a request through supported workflow transitions.

Authenticated requests use the header `Authorization: Bearer <token>`. Refer to the controllers and DTOs for the exact request and response formats.

## Checks and Tests

Run backend tests from the backend directory:

```powershell
.\mvnw.cmd test
```

Run frontend checks from the frontend directory:

```powershell
npm run lint
npm run build
```

The project was previously reported to pass 22 backend tests, frontend lint, and frontend build. Run these commands again against your current checkout before making a release.

## Known Gaps and Planned Improvements

The following items are planned for later iterations and are not claimed as completed V1 features:

- Explain why a family member is uploading a document and connect it to an admin request or support case.
- Allow admins to register volunteer accounts.
- Give admins access to the minimum family-profile details needed to make support assignments.
- Add notifications for request creation, assignment, and status changes.
- Add an approved identity and family-relationship verification process before handling real service records.
- Consider stronger deployment configuration, monitoring, and operational controls before any real-world use.

## Security and Responsible Use

- Use synthetic test accounts and sample documents only during development.
- Do not commit `.env` files, database passwords, JWT secrets, private keys, uploaded files, or real personal/defence records.
- Review `.gitignore` before staging files and inspect `git status` and the staged diff before committing.
- Local development settings are not a production security configuration. Use HTTPS, managed secrets, secured database access, backups, and appropriate access controls before deployment.
- Do not describe this project as officially affiliated with or verified by the Indian Armed Forces.

## License

All rights reserved. No open-source license has been granted unless one is added explicitly by the project owner.
