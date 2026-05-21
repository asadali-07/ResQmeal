# 🍽️ ResQmeal Backend — Real-Time Food Rescue Infrastructure

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

---

# 📌 Overview

**ResQmeal Backend** is a production-oriented real-time logistics infrastructure built to power the ResQmeal food rescue ecosystem.

The backend orchestrates the complete donation lifecycle by synchronizing:

- 🍴 Restaurants (Food Donors)
- 🏢 NGOs (Receivers)
- 🚴 Volunteers (Delivery Partners)
- 🛡️ Administrators

through real-time APIs, WebSocket communication, geospatial intelligence, QR-based verification systems, and autonomous scheduled workflows.

Unlike traditional REST-only backends, ResQmeal combines:

- Event-driven Socket.io architecture
- Real-time geolocation streaming
- MongoDB geospatial indexing
- QR-based secure handoff verification
- Autonomous cron systems
- Distributed role-based authentication
- Redis-powered session/caching infrastructure

The backend was engineered to simulate real-world logistics and dispatch systems while solving food waste through technology.

---

# 🚀 Backend Tech Stack

---

# ⚙️ Runtime & Framework

- **Node.js**
- **Express.js v5**

Express powers:
- REST APIs
- Authentication workflows
- Route middleware pipelines
- Error handling
- Socket integration

The architecture follows a modular scalable backend structure.

---

# 🗄️ Database Layer

## 🍃 MongoDB + Mongoose

MongoDB is used as the primary database.

Mongoose enables:
- Schema modeling
- Validation
- Middleware hooks
- Relationship population
- Geospatial querying

---

## ⚡ Redis (ioredis)

Redis is integrated for:

- Session caching
- Temporary token storage
- Socket optimization
- Notification buffering
- Real-time presence tracking

This improves backend responsiveness under concurrent activity.

---

# 🔄 Real-Time Communication

## ⚡ Socket.io

Socket.io powers the real-time logistics engine.

The backend uses WebSockets for:

- Live volunteer tracking
- Claim synchronization
- Instant notifications
- Real-time messaging
- Presence detection
- Delivery coordination

---

# 🔐 Authentication & Security

## 🔑 JWT Authentication

Authentication is handled using JWT tokens.

Features include:

- Secure login sessions
- Token verification
- Protected routes
- Role validation
- Session persistence

---

## 🔒 Password Security

Passwords are encrypted using:

- `bcrypt`
- `bcryptjs`

This ensures secure credential storage.

---

# ☁️ File Upload & Media System

## 📸 Multer + ImageKit

Food images and user profile photos are uploaded using:

- Multer
- ImageKit

Benefits include:

- Cloud-based storage
- Faster media delivery
- Reduced server load
- Scalable image hosting

---

# 🗺️ Geospatial Intelligence

## 📍 Mapbox SDK

Mapbox powers:
- Route previews
- Volunteer tracking
- Geo-based NGO matching
- Interactive logistics maps

The backend processes:
- Reverse geocoding
- Coordinate storage
- Route optimization support

---

# ⏱️ Background Automation

## 🕒 Node-Cron

The backend uses `node-cron` for autonomous maintenance tasks.

Automated workflows include:

- Expired food cleanup
- Delivery escalation
- Notification scheduling
- Analytics processing
- Stale claim management

---

# 📧 Notification Infrastructure

## ✉️ Nodemailer + Google APIs

Notification systems support:

- Email alerts
- Claim notifications
- Volunteer reminders
- NGO delivery updates
- Verification messages

The backend also includes a centralized Notification Service.

---

# 🛡️ Security & Utility Middleware

Additional backend utilities include:

- CORS
- Cookie Parser
- Express Rate Limit
- dotenv
- UUID generation

These improve:
- Security
- API reliability
- Environment management
- Abuse prevention

---

# 🧱 Backend Architecture

The backend follows a modular scalable architecture.

---

# 📁 Project Structure

```text
src/
├── app.js                  # Express initialization & middleware setup
├── controllers/            # Request handling logic
├── cron/                   # Scheduled background jobs
├── db/                     # MongoDB & Redis configuration
├── middlewares/            # Authentication & Multer middleware
├── models/                 # Mongoose database schemas
├── routes/                 # Express route definitions
├── services/               # Shared business logic
├── socket/                 # Socket.io server architecture
├── utils/                  # Helper utilities
└── validations/            # Request validation logic

server.js                   # Main server bootstrap file
```

The architecture separates:

- Business logic
- Controllers
- Data models
- Real-time socket systems
- Shared services

This improves scalability and maintainability.

---

## 🧠 Core Backend Features

### 👥 Multi-Role Authentication System

The backend supports dedicated authentication flows for:

- Restaurants
- NGOs
- Volunteers
- Admins

Each role has:

- Isolated permissions
- Dedicated middleware checks
- Protected routes
- Role-specific dashboard access

### 🛡️ Role-Based Access Control (RBAC)

RBAC middleware prevents unauthorized access.

Examples:

- Volunteers cannot modify NGO verifications
- Restaurants cannot access admin systems
- NGOs cannot manipulate donation ownership

Example middleware:

```javascript
export const authorizeRoles = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return res.status(403).json({
            success: false,
            message: "Access denied"
         });
      }
      next();
   };
};
```

---

## ⚡ Real-Time Event-Driven Socket Architecture

One of the most advanced backend systems is the Socket.io event architecture.

Traditional REST APIs are insufficient for logistics coordination because state changes must propagate instantly.

ResQmeal solves this using persistent socket communication.

### 🔄 Live Claim Synchronization

When a volunteer accepts a claim:

- Restaurants receive live updates
- NGO dashboards synchronize instantly
- Duplicate claim conflicts are prevented
- Volunteer availability updates globally

This eliminates stale dashboard states.

### 📍 Live Geolocation Streaming

Volunteers continuously stream live coordinates:

```javascript
socket.on("send-location", ({ latitude, longitude, foodId }) => {
   io.to(foodId).emit("receive-location", {
      latitude,
      longitude
   });
});
```

The backend dynamically creates food-specific socket rooms:

```javascript
socket.join(foodId);
```

This enables:

- Live route rendering
- Volunteer tracking
- Delivery transparency
- ETA-like logistics behavior

without repeated HTTP polling.

### 🟢 Presence Detection System

The backend maintains active socket registries for:

- Online/offline tracking
- Volunteer availability
- Active user sessions
- Dispatch readiness monitoring

This improves operational visibility.

### 💬 Real-Time Messaging Infrastructure

Claim-specific messaging is integrated directly into the backend.

Features include:

- Socket-based chat rooms
- Instant message delivery
- Live delivery coordination
- Real-time notification events

This centralizes rescue communication.

---

## 🔐 Immutable QR Verification Workflow

A major logistics challenge is fake delivery completion.

Instead of relying on fragile “Mark Delivered” buttons, the backend implements a secure two-step QR verification pipeline.

### 🔄 Claim Lifecycle State Machine

Claims follow immutable transitions:

`pending → accepted → picked_up → delivered`

Each transition requires backend validation.

### 📦 Pickup Verification

At restaurant handoff:

- Restaurant generates QR payload
- Volunteer scans QR
- Backend validates:
  - `foodId`
  - volunteer identity
  - timestamps
  - claim ownership

Server updates:

```javascript
pickupVerified = true;
pickedUpAt = Date.now();
```

This prevents fake pickup confirmations.

### 🏁 Delivery Verification

At NGO handoff:

- NGO scans volunteer QR
- Backend validates delivery authenticity
- Claim status becomes immutable

Server updates:

```javascript
deliveryVerified = true;
status = "delivered";
```

This creates an auditable chain of custody.

---

## 🗺️ Advanced Geospatial Backend Logic

Geospatial awareness is deeply integrated into backend architecture.

### 📍 MongoDB 2dsphere Indexing

Food donations are stored as GeoJSON:

```json
location: {
   type: "Point",
   coordinates: [longitude, latitude]
}
```

MongoDB `2dsphere` indexing enables:

- Nearby NGO matching
- Radius queries
- Volunteer proximity filtering
- Geo-based rescue optimization

### 🛣️ Route Coordination Support

The backend supports:

- Volunteer route previews
- Pickup/dropoff path generation
- Dynamic coordinate broadcasting
- Real-time movement synchronization

Mapbox APIs are used for geospatial intelligence.

---

## ⏱️ Autonomous Cron-Based Maintenance Engine

Food rescue systems are highly time-sensitive.

The backend uses `node-cron` for autonomous workflows.

### 🗑️ Expired Food Cleanup

Expired donations are automatically detected and removed.

Example cron logic:

```javascript
cron.schedule("*/5 * * * *", async () => {
   await Food.updateMany(
      { expiryTime: { $lt: new Date() } },
      { status: "expired" }
   );
});
```

This prevents unsafe food listings from remaining active.

### 🔔 Automated Notification Workflows

Cron systems also:

- Remind volunteers of pending pickups
- Notify NGOs of incoming deliveries
- Escalate delayed claims
- Detect abandoned rescue tasks

### 📊 Analytics Processing

Background jobs calculate:

- Meals rescued
- Delivery success rates
- Volunteer participation
- NGO engagement metrics

This powers admin analytics dashboards.

---

## 📡 REST API Architecture

The backend exposes modular REST APIs.

### 🛣️ API Modules

```text
routes/
├── auth.routes.js
├── food.routes.js
├── claim.routes.js
├── ngo.routes.js
├── volunteer.routes.js
├── admin.routes.js
├── message.routes.js
└── notification.routes.js
```

The APIs are organized around domain-driven functionality.

### 🧩 Controller Layer

Controllers handle:

- Request parsing
- Business logic orchestration
- Validation
- Response formatting
- Error management

Example domains:

```text
controllers/
├── auth.controller.js
├── food.controller.js
├── claim.controller.js
├── message.controller.js
└── notification.controller.js
```

### 🗃️ Database Models

The backend uses modular Mongoose schemas.

Example models:

```text
models/
├── User.js
├── Food.js
├── Claim.js
├── Message.js
├── Notification.js
└── Ngo.js
```

Schemas support:

- Validation
- Relationships
- Middleware hooks
- Geospatial indexing

---

## 🛠️ Getting Started

### 📋 Prerequisites

Before running the backend ensure you have:

- Node.js v18+
- MongoDB instance
- Redis server
- Mapbox API Key
- ImageKit credentials
- SMTP Email configuration

### 📦 Installation

Install dependencies:

```bash
npm install
```

### 🔐 Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000

MONGO_URI=your_mongodb_url

REDIS_URI=your_redis_url

JWT_SECRET=your_jwt_secret

MAPBOX_TOKEN=your_mapbox_token

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url

SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
```

### ▶️ Running the Server

#### Development Mode

```bash
npm run dev
```

Uses:

- Nodemon
- Auto reload
- Development logging

#### Production Mode

```bash
npm start
```

---

## 🧠 Real-World Backend Challenges Solved

### ❌ Race Condition Prevention

**Problem:**
Multiple volunteers attempting the same claim simultaneously.

**Solution:**
- Atomic claim validations
- Claim locking logic
- Socket synchronization

### ❌ Stale Logistics Data

**Problem:**
Polling introduces tracking delays.

**Solution:**
- Persistent WebSocket streams
- Event-driven synchronization

### ❌ Fake Delivery Completion

**Problem:**
Simple status buttons are insecure.

**Solution:**
- Two-step QR verification workflow
- Immutable claim transitions

### ❌ Expired Food Liability

**Problem:**
Expired food remaining active creates risk.

**Solution:**
- Automated cron cleanup engine

---

## 📈 Scalability Considerations

The backend was designed for future scalability.

Potential future upgrades:

- Redis Pub/Sub socket scaling
- Kafka event streaming
- Microservice decomposition
- AI-powered dispatch optimization
- Kubernetes orchestration
- Distributed notification queues
- Horizontal socket scaling

---

## 🚀 Technical Highlights

- ✔ Node.js + Express architecture
- ✔ Real-time Socket.io communication
- ✔ MongoDB geospatial querying
- ✔ Redis caching infrastructure
- ✔ QR-based secure verification
- ✔ Autonomous cron systems
- ✔ Multi-role RBAC security
- ✔ Production-oriented backend design

---

## 📌 Conclusion

The ResQmeal backend is not a traditional CRUD server.

It is a production-grade real-time logistics infrastructure engineered using scalable backend architectural patterns.

The project demonstrates:

- Advanced backend engineering
- Event-driven architecture
- Real-time synchronization systems
- Geospatial intelligence
- Secure QR verification workflows
- Distributed role-based security
- Autonomous backend automation

It reflects the complexity of real-world logistics and dispatch systems while solving a meaningful social problem through technology.