# 📊 Personal Finance Management Application (Backend)

![WebP Image](public/assets/img.webp)

## 📝 Introduction

This is the backend of a personal finance management application built using **Node.js** and **PostgreSQL**. The app helps users manage their personal expenses by adding, updating, and tracking their expenditures. It provides RESTful APIs with features like user authentication, expense tracking, and data storage. The backend is designed to be deployed on a VPS for scalability and reliability.

## 🚀 Technologies Used

- **Backend**: Node.js (Express framework)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Caching**: Redis
- **Authentication & Security**: JWT (JSON Web Token)
- **Validation**: Zod
- **Email Service**: Nodemailer
- **Media Storage**: Cloudinary
- **API Documentation**: Swagger
- **Deployment**:
  - VPS
  - Docker
  - CI/CD with GitHub Actions

## 📌 Key Features

- **Income & Expense Management**: Track and categorize daily income and expenses.
- **Statistics & Reports**: Provide visual charts and insights for financial analysis.
- **Savings Planning**: Set savings goals and monitor progress.
- **High Security**: Support JWT authentication, data encryption, and personal data protection.
- **Email Notifications**: Notify users of important transactions via email.
- **Secure File Storage**: Integrate Cloudinary for managing financial images and documents.
- **API Documentation**: Use Swagger to provide detailed API documentation.
- **Data Validation with Zod**: Ensure robust request validation for secure and reliable data handling.
- **Modern Deployment**:
  - Runs on VPS with Docker.
  - Automated CI/CD integration with GitHub Actions.

## 📦 Installation & Running the Project

### System Requirements

- Node.js >= 16.x
- PostgreSQL
- Redis
- Docker (optional)

#### Step 1. Clone the Repository

```sh
git clone https://github.com/mlintt25/FinManagement-Node-Postgre.git
```

```sh
cd FinManagement-Node-Postgre
```

#### Step 2. Create and Configure environment variables

Create environment file .env at same level as src/ directory. Your .env file based on the provided .env.example file. Copy the contents of .env.example and add the necessary values in your respective .env file.

#### Step 3. Install dependencies

- You can replace yarn if you want, in this application it is default using npm

```bash
npm install
```

These files will store your environment-specific variables such as database URI, JWT secret, etc.

#### Step 4. Initialize Prisma and PostgreSQL

First make sure you have changed your PostgreSQL account _username_ and _password_ into the **DATABASE_URL** variable in the _.env_ file.

```bash
DATABASE_URL = postgresql://<username>:<password>@localhost:5432/personal_finance_management
```

Then run the following command:

```bash
npx prisma db push
```

- Additionally you can use the following command to see more commands to interact with Prisma:

```bash
npx prisma
```

#### Step 5. Running the application

You can now run the application in different environments by using the following scripts defined in _**package.json**_:

For development:

```bash
npm run dev
```

- This will run the app in development mode with nodemon.

Or production:

```bash
npm run build
```

```bash
npm run start
```

There are many more commands, you can find them in the _**package.json**_ file and can change them as needed.
