# NestJS E-commerce Backend

A robust and scalable backend for an e-commerce platform built with NestJS. This project provides a complete set of features for managing products, users, orders, and authentication, all within a modern, modular architecture. The application is fully containerized with Docker for easy setup and deployment.

## ✨ Features

- **RESTful API**: A well-structured and documented API for all e-commerce functionalities.
- **Authentication**: Secure JWT-based authentication with Access and Refresh Token strategies using Passport.js.
- **Role-Based Access Control (RBAC)**: Guards to restrict access to certain endpoints based on user roles (e.g., admin).
- **Product Management**: Full CRUD operations for products, categories, and subcategories.
- **Image Uploads**: Handles product image and thumbnail uploads, with on-the-fly image processing and optimization using `multer` and `sharp`.
- **Order Management**: Logic for creating and managing user orders.
- **User Management**: Endpoints for managing user data.
- **Configuration Management**: Centralized configuration using `@nestjs/config`.
- **Database Integration**: Uses Mongoose for elegant MongoDB object modeling.
- **Dockerized Environment**: Comes with a multi-stage `Dockerfile` and a `docker-compose.yml` for a one-command setup of both the application and a local MongoDB database.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Passport.js](http://www.passportjs.org/) (jwt, local strategies)
- **Image Handling**: [Multer](https://github.com/expressjs/multer) & [Sharp](https://sharp.pixelplumbing.com/)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Linting/Formatting**: ESLint & Prettier

## 🚀 Getting Started

There are two ways to get the application running: using Docker (recommended for a quick and consistent setup) or running it locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the Docker setup)
- A `.env` file (see the [Environment Variables](https://www.google.com/search?q=%23-environment-variables) section below)

### 🐳 Running with Docker (Recommended)

This is the fastest and most reliable way to get started. It will set up both the application and a MongoDB database container that are configured to work together.

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Create an environment file:**
    Create a file named `.env` in the root of the project and fill it with your configuration variables. You can use the `.env.example` section below as a template.

3.  **Build and run the containers:**
    Run the following single command in your terminal.

    ```bash
    docker-compose up --build
    ```

    - The `--build` flag is only needed the first time or when you make changes to the `Dockerfile`.
    - To run in the background, use `docker-compose up -d`.

The API will be available at `http://localhost:8000` (or whichever port you configured).

### 💻 Running Locally (Without Docker)

1.  **Clone the repository:**

    ```bash
    git https://github.com/MahdiPourkeshavarz/nestjs-ecommerce.git
    cd <your-project-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the environment:**
    Create a `.env` file in the root directory and add the necessary configuration. Make sure your `DATABASE_URL` points to a running MongoDB instance.

4.  **Run the application:**

    ```bash
    npm run start:dev
    ```

    The application will start in watch mode, automatically restarting on file changes. The API will be available at `http://localhost:8000`.

## 📝 Environment Variables

Create a `.env` file in the project root and add the following variables. Do not commit this file to version control.

```env
# --- Application Configuration ---
PORT=8000
HOST=127.0.0.1

# --- Database ---
# Use your MongoDB Atlas connection string for production/cloud dev
# For local Docker setup, this will be overridden by docker-compose.yml
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority

# --- JWT Authentication ---
JWT_ACCESS_TOKEN_SECRET=your_super_secret_key_for_access_tokens
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET=your_even_more_secret_key_for_refresh_tokens
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# --- Default Admin User (for initial seeding, if applicable) ---
ADMIN_FIRSTNAME=admin
ADMIN_LASTNAME=admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
ADMIN_PHONE_NUMBER=09123456789
ADMIN_ADDRESS=Some Address
```

## 📂 Project Structure

The project structure is organized by feature modules, promoting modularity and separation of concerns.

```
/
├── public/              # Static files (e.g., uploaded images)
├── src/
│   ├── auth/            # Authentication logic (controllers, services, strategies, guards)
│   ├── categories/      # Categories feature module
│   ├── common/          # Common utilities or decorators
│   ├── config/          # Application configuration (multer.config.ts)
│   ├── database/        # Database related files
│   ├── orders/          # Orders feature module
│   ├── products/        # Products feature module (includes image-processing.service.ts)
│   ├── subcategories/   # Subcategories feature module
│   ├── users/           # Users feature module
│   ├── app.module.ts    # Root application module
│   └── main.ts          # Application entry point
├── .dockerignore
├── .env                 # (You create this) Environment variables
├── .gitignore
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Multi-stage Docker build instructions
└── package.json
```

## 📚 API Documentation

This project is set up to easily integrate with Swagger for auto-generated, interactive API documentation. To enable it:

1.  Install Swagger dependencies:
    ```bash
    npm install @nestjs/swagger
    ```
2.  In `src/main.ts`, add the Swagger setup code.

Once configured, the interactive API documentation will be available at `http://localhost:8000/api`.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
