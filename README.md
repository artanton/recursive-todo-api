# To-Do List Web Server  

The backend for the To-Do List application is built using **Node.js + Express** and supports infinite nesting of subtasks. It allows users to create, update, delete tasks and subtasks, mark tasks as completed, and manage user authentication with **access token** and **refresh token**.

## Features  

- **User Authentication & Management**  
  - Register, login, logout  
  - Email verification and resend verification  
  - Update username, password, and avatar  
  - Token-based authentication using **access token** and **refresh token**  

- **Task Management**  
  - Create tasks and subtasks (infinite nesting)  
  - Update task details  
  - Delete tasks and subtasks  
  - Mark tasks as completed  


## Project Structure  

```plaintext
/backend
├── public               # Static files
│   ├── avatars          # User media file
├── controllers          # Business logic for tasks and authentication
├── models               # Mongoose schemas for users and tasks
├── routes               # Express route handlers
│   ├── authRouter.js    # User management routes
│   ├── tasksRouter.js   # Task management routes
├── middlewares          # Middleware functions (auth, validation, etc.)
├── schemas              # Request validation schemas using Joi
├── services             # Services for database interaction and business logic
├── helpers              # Utility functions
├── decorators           # Decorators for validating requests
├── app.js               # Express application setup
├── server.js            # Server entry point
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables  
```

## Installation & Setup  

### 1. Clone the repository  

```sh
git clone https://github.com/your-username/todo-list-backend.git
cd todo-list-backend
```

### 2. Install dependencies  

```sh
npm install
```

### 3. Set up environment variables  

Create a `.env` file and configure the required values:

```
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

### 4. Start the server  

```sh
npm run dev
```

The API will be available at `http://localhost:5000/api`.

---

## API Endpoints  

### **Authentication & User Management**  

| Method | Endpoint                         | Description                            | Auth Required |
|--------|----------------------------------|----------------------------------------|--------------|
| POST   | /api/users/register             | Register a new user                    | ❌           |
| POST   | /api/users/login                | Login user and return access token     | ❌           |
| GET    | /api/users/verify/:verificationCode | Verify user email                     | ❌           |
| POST   | /api/users/verify               | Resend email verification              | ❌           |
| PATCH  | /api/users/avatar               | Update user avatar                     | ✅           |
| PATCH  | /api/users/update               | Update user password                   | ✅           |
| GET    | /api/users/refresh              | Refresh access token                   | ✅           |
| GET    | /api/users/current              | Get current user data                  | ✅           |
| POST   | /api/users/logout               | Logout user                            | ✅           |

### **Task Management**  

| Method | Endpoint          | Description                        | Auth Required |
|--------|------------------|----------------------------------|--------------|
| GET    | /api/tasks       | Get all tasks and subtasks       | ✅           |
| POST   | /api/tasks       | Create a new task                | ✅           |
| PATCH  | /api/tasks/:id   | Update a task (rename, mark as done) | ✅   |
| DELETE | /api/tasks/:id   | Delete a task                    | ✅           |

---

## Technologies Used  

- **Node.js** & **Express.js** – Web server framework  
- **MongoDB** & **Mongoose** – Database and ODM  
- **JWT (JSON Web Token)** – Authentication & security  
- **Joi** – Data validation  
- **Swagger** – API documentation  
- **Morgan** – Logging  
- **cookie-parser** – Handling cookies  
- **Multer** – File uploads (for avatars)  

## Notes  

- The backend is deployed on **Render**, so the first request might take a few seconds to process due to free-tier limitations.  
- Swagger API documentation is available at `/api-docs`.  
- Task operations support infinite nesting, allowing users to create complex task hierarchies.  

---

## Contributing  

1. Fork the repository  
2. Create a new feature branch (`git checkout -b feature-name`)  
3. Commit your changes (`git commit -m "Add new feature"`)  
4. Push the branch (`git push origin feature-name`)  
5. Open a pull request  

---

## License  

This project is open-source and available under the **MIT License**.
