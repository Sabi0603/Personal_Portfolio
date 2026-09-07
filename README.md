# Personal Portfolio

A full-stack personal portfolio website built with React, Vite, Tailwind CSS, and a Node.js backend.

## Overview

This portfolio project combines a modern React frontend with a dedicated backend API. It is designed to present projects, skills, and professional information through a responsive web experience while providing a foundation for dynamic portfolio content.

## Features

- Responsive personal portfolio interface
- Project and profile presentation
- React-based frontend with client-side routing
- Tailwind CSS styling
- Backend API built with Express
- MongoDB integration through Mongoose
- Authentication and protected backend functionality
- Image management with Cloudinary
- Email functionality with Nodemailer
- API security with Helmet and rate limiting

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React
- Three.js

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Cloudinary
- Nodemailer
- Helmet
- Express Rate Limit

## Project Structure

```text
Personal_Portfolio/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── src/
│   └── package.json
└── .gitignore
```

## Getting Started

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

Create the required `.env` file in the backend and configure the database, authentication, Cloudinary, email, and other application settings used by the server.

Never commit secrets or environment files to the repository.

## Project Type

MERN Stack Project

## Author

Sabari M

[GitHub Profile](https://github.com/Sabi0603)