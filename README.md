# 📝 Full Stack Blog Platform

A modern, full-stack Blog Platform built with **React + Vite** (frontend), **Node.js + Express** (backend), **Sequelize + MySQL/PostgreSQL** (ORM/DB), **JWT Auth**, and **Tailwind CSS**. The app allows users to register, log in, create/edit/delete blog posts, categorize them, and filter by tags.

---

## 📁 Project Structure

```
├── backend/
│   ├── app.js                  # Express app entry (routes/middleware)
│   ├── server.js               # Server and DB init
│   ├── config/
│   │   └── db.js               # Sequelize DB connection
│   ├── controllers/
│   │   ├── authController.js   # Register/Login logic
│   │   └── postController.js   # Post CRUD logic
│   ├── middlewares/
│   │   ├── auth.js             # JWT auth middleware
│   │   └── errorHandler.js     # Central error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Tag.js
│   │   ├── Category.js
│   │   └── index.js            # Associations and exports
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── schemas/
│   │   └── postSchema.js       # Zod schema validation
│   └── scripts/
│       └── seedCategories.js   # Seed initial categories
│
├── frontend/
│   ├── index.html              # Root HTML template
│   ├── eslint.config.js        # ESLint rules
│   ├── src/
│   │   ├── App.jsx             # Route logic
│   │   ├── context/            # Auth context provider
│   │   ├── components/
│   │   │   ├── Auth/           # Login, Register pages
│   │   │   ├── Blog/           # BlogList, BlogPost, Create/Edit
│   │   │   └── Common/         # Header, Footer, Loader, etc.
│   │   ├── pages/              # Home, Dashboard, NotFound
│   │   └── services/           # API utils, protected routes
```

---

## 🚀 Features

### ✅ Authentication (JWT-based)
- User Registration and Login
- Protected Routes using React Context
- Token stored and passed for secure API access

### 📝 Blog Functionality
- Create, Edit, Delete Blog Posts
- Tags & Category management
- Paginated post listing
- View single post with author info, category, and tags
- Filter posts by category and tags

### 🧩 Tech Stack

| Frontend              | Backend                 | Database/ORM           |
|-----------------------|-------------------------|-------------------------|
| React + Vite          | Node.js + Express       | Sequelize + MySQL/PGSQL |
| Tailwind CSS          | RESTful API             |                        |
| React Router          | JWT Authentication      |                        |

---

## 🌐 Getting Started

### 🔧 Prerequisites

- Node.js
- npm or yarn
- MySQL or PostgreSQL
- `.env` file (see below)

---

## 📦 Installation

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/blog-platform
cd blog-platform
```

### 2️⃣ Setup backend
```bash
cd backend
npm install

# Create .env file in backend/
touch .env
```

`.env` file example:
```env
PORT=5000
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_DIALECT=mysql
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

```bash
# Create DB and seed default categories
npx sequelize-cli db:create
node scripts/seedCategories.js

# Run backend server
npm run dev
```

### 3️⃣ Setup frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🧪 API Endpoints (Backend)

| Endpoint             | Method | Description              |
|----------------------|--------|--------------------------|
| `/api/auth/register` | POST   | User registration        |
| `/api/auth/login`    | POST   | User login               |
| `/api/posts`         | GET    | Get all posts (with filters) |
| `/api/posts/:id`     | GET    | Get post by ID           |
| `/api/posts`         | POST   | Create post (auth)       |
| `/api/posts/:id`     | PUT    | Update post (auth)       |
| `/api/posts/:id`     | DELETE | Delete post (auth)       |

---

## 🧪 Frontend Routes (React)

| Path                  | Description                   |
|-----------------------|-------------------------------|
| `/`                   | Blog listing (with filters)   |
| `/posts/:id`          | View single post              |
| `/dashboard`          | Auth dashboard (protected)    |
| `/posts/create`       | Create new post (protected)   |
| `/posts/:id/edit`     | Edit post (protected)         |
| `/login` & `/register`| Auth routes                   |

---

## 🧰 Useful Scripts

### Seed Categories:
```bash
node backend/scripts/seedCategories.js
```

### Migrate DB (if using CLI):
```bash
npx sequelize-cli db:migrate
```

---

## 📸 UI Preview

> *(Include screenshots here if available)*

---

## 🧠 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Pull requests are welcome! Please open issues to suggest features or report bugs.

---

## 🙋‍♂️ Author

**K Vishwa**  
Frontend & Backend Developer

---
