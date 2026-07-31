# 🏷️ VSS Software — EdTech & Staffing Platform

A full-stack **EdTech + Staffing/Recruitment Platform** built using **MongoDB, Express.js, React.js, and Node.js (MERN Stack)**.

---

# 💡 About this Project

VSS Software is a full-featured web platform that brings **online learning, live classrooms, internships, recruitment, and staffing** together in one place.

The platform is designed for a real EdTech & Staffing company with separate dashboards and workflows for **Students, Teachers, Employers, Recruiters, and Admins**.

### ✨ Features

- 🔐 Sign up & Login with OTP-based Email Verification
- 📚 Browse and enroll in courses with Razorpay payments
- 🎥 Join real-time Live Classes powered by LiveKit
- 💼 Apply for internships and hiring drives
- 🤝 Explore Staffing & Recruitment services
- 🤖 Access AI Solutions provided by the platform
- 👨‍🏫 Teacher Panel to manage courses, batches, classes, and resources
- 👨‍💼 Admin Panel to manage users, courses, internships, recruitment, and website content

This project helped me gain hands-on experience in building real-world full-stack applications with **Role-Based Authentication**, **Live Video Streaming**, **Payment Gateway Integration**, **Cloud Storage**, and **Scalable Backend Architecture**.

---

# ⚡ Technologies Used

### 🌐 Frontend

- ⚛️ React.js (Vite)
- 🛣️ React Router DOM
- 🎨 Tailwind CSS
- 🎥 LiveKit Client SDK
- 🔗 Axios

### ⚙️ Backend

- 🟢 Node.js
- 🚀 Express.js
- 🍃 MongoDB + Mongoose
- 🔴 Redis
- 🔐 JWT Authentication
- 🔒 bcrypt / bcryptjs
- 💳 Razorpay
- ☁️ Cloudinary
- 🗂️ Supabase Storage
- 📧 Brevo API 
- 📄 PDFKit
- 🎥 LiveKit Server SDK

---

# 🚦 Running the Project

## 📌 Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- MongoDB Atlas
- Redis
- Razorpay Account
- Cloudinary Account
- Supabase Account
- LiveKit Cloud Account
- Brevo Account

---

## 📁 Environment Variables

Create a **`.env`** file inside the **server** folder.

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=
JWT_SECRET=
REDISPASSWORD=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email
BREVO_API_KEY=
FROM_EMAIL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RECRUITMENT_BUCKET=
SUPABASE_RESOURCE_BUCKET=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

---

# 🔧 Backend Setup

```bash
cd server

npm install

npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 📂 Project Structure

```text
VSS-SOFTWARE/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api.js
│   │
├── server/
│   ├── Controller/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── package.json
└── README.md
```

---

# 🚀 Deployment

- ▲ Frontend deployed on **Vercel**
- 🚀 Backend can be deployed on **Render**, **Railway**, **AWS**, or any Node.js hosting platform

---

# 🌟 Key Features

- 🔐 OTP Authentication
- 👥 Role-Based Access Control
- 🎥 Live Classroom System
- 💳 Secure Payment Gateway
- ☁️ Cloud File Storage
- 📧 Email Notifications
- 📄 Automatic PDF Receipt Generation
- 📚 Course & Batch Management
- 💼 Internship & Recruitment Module
- 🤝 Staffing Services

---

# 👨‍💻 Author

**Prashant Bhardwaj**

Full Stack Developer | MERN Stack Developer

---
