# ZAPPIT TASK MANAGER

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)

## Project Overview

Zappit Task Manager is a task manager which help organization to manage all their Projects at a Zappit Platform

## Tech Stack

This project uses:
- **Next.js** - for server-side rendering and frontend development
- **Tailwind CSS** - for utility-first styling
- **Clerk** - for authentication and user management
- **Neon DB** - for database management
- **ShadCN UI** - for component styling and design consistency

## Installation
### Prerequisites

Ensure you have these installed:
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git

2. Change into the project directory:
   ```bash
    cd your-repo-name

3. Install dependencies:
   ```bash
   npm install

### Running the Application
1. **Set Up Environment Variables:** Create a .env.local file in the root directory, and add the required environment variables (see below).
   
3. **Start the Development Server**
   ```bash
   npm run dev

 The app will be available at http://localhost:3000.

### Environment Variables
  In your .env.local file, include:

    ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= <your-clerk-frontend-api-key>
    CLERK_SECRET_KEY= <your-clerk-api-key>

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
    
    DATABASE_URL= <your-neon-db-url>


### Testing
  To run tests, use the following command:
  ```bash
  npm test
