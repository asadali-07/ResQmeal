# 🍽️ ResQmeal — Full-Stack Food Rescue Ecosystem

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) 
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) 
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

---

# 📌 Overview

**ResQmeal** is a production-oriented full-stack food rescue ecosystem engineered to minimize food waste through real-time logistics coordination.

The platform intelligently connects:

- 🍴 Restaurants
- 🏢 NGOs
- 🚴 Volunteers
- 🛡️ Administrators

into a synchronized food redistribution pipeline where surplus food is safely delivered instead of discarded.

Unlike traditional CRUD applications, ResQmeal integrates:

- Real-time WebSocket communication
- Geospatial intelligence
- QR-based delivery verification
- Autonomous cron-driven cleanup systems
- Role-based access control
- Live logistics tracking
- Event-driven synchronization

The system simulates a real-world rescue logistics infrastructure while solving a meaningful social problem.

---

# 🧠 Problem Statement

Millions of meals are wasted daily while nearby communities struggle with hunger.

Traditional food donation systems suffer from:

- Delayed coordination
- No delivery transparency
- Poor volunteer management
- Fraudulent delivery confirmations
- Expired food handling issues
- Lack of real-time communication

**ResQmeal** solves these problems through a real-time rescue logistics network capable of securely coordinating food donations end-to-end.

---

# 🏗️ System Architecture

## Frontend Stack

- React.js
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router DOM
- Framer Motion
- React Map GL
- Socket.io Client

---

## Backend Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- JWT Authentication
- Node-Cron
- Multer
- Cloudinary

---

## Infrastructure Concepts

- MongoDB 2dsphere Geospatial Indexing
- Event-Driven WebSocket Architecture
- Real-Time Logistics Synchronization
- Secure QR Verification Pipeline
- Role-Based Access Control (RBAC)
- Autonomous Scheduled Maintenance

---

# 👥 Multi-Role Ecosystem

---

# 🍴 Restaurant Portal

Restaurants can:

- Upload surplus food donations
- Add food quantity and type
- Specify expiry duration
- Add pickup instructions
- Pin exact pickup location on Mapbox
- Generate secure QR codes
- Track volunteer arrival live

---

## Key Engineering Features

- Dynamic donation lifecycle states
- Real-time claim updates
- Geo-tagged food listings
- Automatic food expiry handling

---

# 🏢 NGO Dashboard

NGOs are responsible for receiving and validating food deliveries.

Features include:

- Nearby food discovery
- Claim approval workflow
- Real-time delivery monitoring
- Final delivery QR verification
- Delivery history tracking

---

## Smart NGO Matching

The backend prioritizes donations using:

- Distance calculations
- Food expiry urgency
- Food quantity
- Volunteer availability

MongoDB geospatial queries enable efficient proximity-based matching.

---

# 🚴 Volunteer Logistics System

Volunteers act as the transportation bridge between restaurants and NGOs.

Core capabilities include:

- Live route previews
- Real-time tracking
- Claim acceptance workflow
- Pickup verification
- Delivery completion verification
- Dynamic route rendering

The volunteer dashboard behaves similarly to lightweight logistics dispatch software.

---

# 🛡️ Admin Control Center

Admins maintain ecosystem integrity through:

- User moderation
- Claim monitoring
- Fraud prevention
- Analytics dashboards
- Emergency intervention controls

Admins can monitor active deliveries in real time.

---

# ⚡ Real-Time Socket Architecture

One of the most advanced components of ResQmeal is its event-driven Socket.io architecture.

Traditional REST APIs introduce delays and stale data during logistics operations.

ResQmeal solves this using persistent WebSocket communication.

---

# 🔄 Live Claim Synchronization

When a volunteer accepts a rescue request:

- NGOs update instantly
- Restaurants receive live notifications
- Duplicate claim conflicts are prevented
- Volunteer availability updates globally

This eliminates stale UI states.

---

# 📍 Volatile Geolocation Streaming

As volunteers move:

```js
socket.emit("send-location", {
   latitude,
   longitude,
   foodId
});
```

The backend dynamically routes packets into food-specific rooms:

```js
socket.join(foodId);
```

Connected dashboards receive:

- Live coordinate updates
- Movement rendering
- Volunteer tracking
- Real-time route synchronization

This removes the need for inefficient HTTP polling.

## 🟢 Presence Detection System

The backend maintains active socket sessions for:

- Online/offline visibility
- Volunteer availability
- Real-time dashboard awareness
- Dispatch readiness tracking

## 💬 Contextual Real-Time Messaging

Restaurants and volunteers communicate inside active claims.

Features include:

- Claim-specific chat rooms
- Real-time socket messaging
- Pickup coordination
- Delivery updates
- Live notifications

This centralizes operational communication.

---

## 🔐 Immutable Two-Step QR Verification

A major logistics issue is fake delivery confirmation.

Instead of using fragile "Mark Delivered" buttons, ResQmeal introduces a secure QR-based handoff verification system.

### 🔄 Claim State Machine

Claims follow immutable transitions:

`pending → accepted → picked_up → delivered`

Each transition requires backend verification.

### 📦 Step 1 — Restaurant Pickup Verification

When the volunteer reaches the restaurant:

- Restaurant generates QR code
- Volunteer scans QR using:
  `@yudiel/react-qr-scanner`
- Backend validates:
  - `foodId`
  - volunteer identity
  - timestamps
  - ownership

Server updates:

```js
pickupVerified = true;
pickedUpAt = Date.now();
```

This prevents fake pickup confirmations.

### 🏁 Step 2 — NGO Delivery Verification

At final delivery:

- NGO scans volunteer QR
- Backend validates delivery authenticity
- Claim state becomes immutable

Server updates:

```js
deliveryVerified = true;
status = "delivered";
```

This creates a verifiable chain of custody.

---

## 🗺️ Advanced Geospatial Intelligence

Geospatial awareness is deeply integrated into ResQmeal.

### 📍 MongoDB 2dsphere Indexing

Food locations are stored as GeoJSON:

```js
location: {
   type: "Point",
   coordinates: [longitude, latitude]
}
```

`2dsphere` indexing enables:

- Radius searches
- Nearby NGO discovery
- Volunteer proximity filtering
- Delivery optimization

### 🛣️ Volunteer Route Visualization

Before accepting claims, volunteers preview routes using Mapbox.

The interface renders:

- Pickup route
- Delivery route
- Dynamic path overlays
- Live movement tracking

This improves operational efficiency.

### 🧭 Real-Time Tracking Experience

As volunteers travel:

- Map markers update live
- Restaurants monitor arrival
- NGOs track incoming deliveries
- Dispatch transparency improves

The UX resembles modern ride-sharing systems.

---

## ⏱️ Autonomous Cron-Based Maintenance Engine

Food rescue systems require strict time sensitivity.

ResQmeal uses `node-cron` for automated backend maintenance.

### 🗑️ Automatic Expiry Cleanup

Expired food donations must never remain active.

Scheduled cron jobs:

- Detect expired donations
- Mark food inactive
- Notify stakeholders
- Remove stale claims

Example:

```js
cron.schedule("*/5 * * * *", async () => {
   await Food.updateMany(
      { expiryTime: { $lt: new Date() } },
      { status: "expired" }
   );
});
```

### 🔔 Automated Notification System

Cron jobs also:

- Remind volunteers of pending pickups
- Notify NGOs about incoming deliveries
- Escalate delayed rescue operations
- Detect abandoned claims

### 📊 Background Analytics Processing

Scheduled jobs compute:

- Meals rescued
- Delivery success rates
- Volunteer participation
- NGO engagement statistics

This powers analytics dashboards.

---

## 🔐 Authentication & Security

ResQmeal implements layered security mechanisms.

### 🔑 JWT Authentication

Users authenticate using secure JWT tokens.

Protected middleware validates:

- Session integrity
- Role authorization
- Claim ownership

### 🛡️ Role-Based Access Control (RBAC)

Each role has isolated permissions.

Examples:

- Restaurants cannot access admin routes
- Volunteers cannot alter NGO verification
- NGOs cannot manipulate restaurant uploads

This ensures operational security.

### ☁️ Secure Media Uploads

Food images are uploaded using:

- Multer
- Cloudinary

Benefits:

- Cloud storage scalability
- Reduced local storage overhead
- Optimized media delivery

---

## 🎨 Frontend Engineering Highlights

The frontend emphasizes responsive UX and synchronized real-time state updates.

### ⚛️ Redux Global State Management

Redux Toolkit manages:

- Authentication state
- Live socket updates
- Claim synchronization
- Notifications
- Dashboard state

### 🎬 Framer Motion Animations

Animations improve responsiveness for:

- Claim cards
- Tracking panels
- Dashboard widgets
- Notifications

### 📱 Responsive Design System

Tailwind CSS enables:

- Mobile-first layouts
- Adaptive dashboards
- Flexible grids
- Responsive map rendering

Supported devices:

- Mobile
- Tablet
- Desktop

---

## 🧠 Real-World Engineering Challenges Solved

### ❌ Race Condition Prevention

**Problem:**
Multiple volunteers attempting to claim the same donation.

**Solution:**
- Atomic validations
- Claim locking
- Socket synchronization

### ❌ Stale Tracking Data

**Problem:**
HTTP polling introduces delays.

**Solution:**
- WebSocket location streaming
- Room-based event broadcasting

### ❌ Fake Delivery Completion

**Problem:**
Simple buttons are insecure.

**Solution:**
- Two-step QR verification pipeline
- Immutable claim transitions

### ❌ Expired Food Risks

**Problem:**
Expired food remaining active creates liability.

**Solution:**
- Automated cron cleanup system

---

## 📈 Scalability Considerations

The architecture was designed with future scalability in mind.

Potential upgrades include:

- Redis Pub/Sub for socket scaling
- Kafka event streaming
- Microservices architecture
- AI-based route optimization
- Predictive NGO recommendation engine
- Push notification services
- Kubernetes deployment pipeline

---

## 🚀 Technical Highlights

- ✔ Real-time Socket.io architecture
- ✔ MongoDB geospatial querying
- ✔ QR-based verification workflows
- ✔ Autonomous cron systems
- ✔ Role-based access control
- ✔ Live logistics tracking
- ✔ Event-driven synchronization
- ✔ Production-oriented MERN architecture

---

## 📌 Conclusion

ResQmeal is not just a food donation application.

It is a production-grade real-time rescue logistics ecosystem engineered using modern full-stack architectural patterns.

The project demonstrates:

- Full-stack engineering capability
- Real-time systems design
- Geospatial intelligence
- Secure workflow orchestration
- Scalable backend architecture
- Advanced synchronization systems

It reflects the complexity of real-world logistics platforms while solving a meaningful social challenge through technology.