# 🍽️ ResQmeal Frontend — Real-Time Food Rescue Interface

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

---

# 📌 Overview

**ResQmeal Frontend** is a highly interactive real-time logistics interface designed for the ResQmeal food rescue ecosystem.

The frontend powers the complete user experience for:

- 🍴 Restaurants (Food Donors)
- 🏢 NGOs (Receivers)
- 🚴 Volunteers (Delivery Partners)
- 🛡️ Admins (System Moderators)

The application was engineered using modern frontend technologies with heavy emphasis on:

- Real-time synchronization
- Geospatial logistics visualization
- Event-driven communication
- Secure QR verification workflows
- Responsive dashboard systems
- Production-grade state management

Unlike traditional static dashboards, ResQmeal behaves like a lightweight real-time logistics platform similar to modern ride-sharing and dispatch systems.

---

# 🚀 Frontend Tech Stack

## ⚛️ Core Framework

- **React 19**
- **Vite 8**

The frontend uses React 19 with Vite for:
- Fast cold-start performance
- Lightning-fast HMR
- Optimized production builds
- Efficient component rendering

---

# 🧠 State Management

## 🔄 Redux Toolkit

Global application state is centralized using Redux Toolkit.

Redux manages:

- Authentication state
- Active claims
- Real-time notifications
- Live volunteer tracking
- Socket synchronization
- User sessions
- Food listings
- Messaging systems

### Example Redux Slices

```text
store/
├── authSlice.js
├── foodSlice.js
├── claimSlice.js
├── notificationSlice.js
├── mapSlice.js
└── socketSlice.js

Redux enables synchronized updates across all dashboards without prop drilling.

## 🎨 UI & Styling System
### 💨 Tailwind CSS 4

Tailwind CSS powers the entire responsive design system.

Benefits include:

- Utility-first styling
- Fully responsive layouts
- Fast UI iteration
- Consistent spacing system
- Adaptive dashboards
- Mobile-first design patterns

---

## 🌐 Routing Architecture
### 🛣️ React Router DOM v7

Routing is handled using React Router DOM v7.

The frontend uses:

- Nested routes
- Protected routes
- Role-based route guards
- Dynamic layouts
- Lazy-loaded route modules

### Example Route Structure

```text
routes/
├── AppRoutes.jsx
├── ProtectedRoute.jsx
├── AdminRoutes.jsx
├── VolunteerRoutes.jsx
└── NgoRoutes.jsx
```

---

## 🔌 API Communication Layer
### 📡 Axios Integration

Axios is used for all HTTP communication with the backend.

The API layer handles:

- JWT token attachment
- Refresh token handling
- Error interception
- Request abstraction
- Centralized API configuration

### API Structure

```text
api/
├── axiosInstance.js
├── authApi.js
├── foodApi.js
├── claimApi.js
└── notificationApi.js
```

---

## ⚡ Real-Time Communication System
### 🔄 Socket.io Client

One of the most advanced frontend systems is the Socket.io integration.

The frontend maintains persistent WebSocket connections for:

- Real-time tracking
- Claim synchronization
- Messaging
- Presence detection
- Notification streaming

### 📍 Live Volunteer Tracking

As volunteers move during delivery:

```js
socket.emit("send-location", {
   latitude,
   longitude,
   foodId
});
```

Connected dashboards receive:

- Live coordinates
- Route updates
- Volunteer movement
- ETA-like tracking behavior

This removes the need for inefficient polling requests.

### 💬 Real-Time Messaging System

The frontend includes claim-specific messaging interfaces.

Features include:

- Live message streaming
- Socket-based communication
- Instant UI updates
- Contextual coordination

This allows:

- Restaurants to coordinate pickups
- NGOs to communicate delivery instructions
- Volunteers to send live updates

### 🟢 Presence Detection

The frontend tracks active user presence using socket sessions.

UI indicators display:

- Online/offline users
- Volunteer availability
- Active delivery sessions
- Connected dashboards

---

## 🗺️ Geospatial & Map System
### 📍 Mapbox GL + React Map GL

The application heavily depends on geospatial logistics visualization.

Map integrations enable:

- Donation location rendering
- Volunteer live tracking
- Route previews
- Geo-based NGO matching
- Interactive delivery maps

### 🛣️ Volunteer Route Preview

Before accepting deliveries, volunteers can preview complete rescue routes.

The map interface renders:

- Pickup location
- Drop-off location
- Route overlays
- Live movement paths
- Dynamic markers

### Example Components

```text
components/
├── VolunteerRoutePreview.jsx
├── LiveTrackingMap.jsx
├── GeoSearchPanel.jsx
└── RouteOverlay.jsx
```

---

## 🔐 QR-Based Verification System
### 📷 QR Code Generation & Scanning

The frontend implements secure QR workflows using:

- `react-qr-code`
- `@yudiel/react-qr-scanner`

### 📦 Pickup Verification

At the restaurant:

- Restaurant dashboard generates QR token
- Volunteer scans QR
- Frontend validates session
- Backend confirms pickup state

### 🏁 Delivery Verification

At NGO handoff:

- NGO scans volunteer QR
- Frontend submits verification payload
- Claim transitions to delivered state

This creates secure handoff validation.

---

## 🧩 Frontend Component Architecture

The application follows a modular reusable component architecture.

### 📁 Project Structure

```text
src/
├── api/              # Axios config and service calls
├── assets/           # Images, icons, static resources
├── components/       # Shared reusable UI components
├── hooks/            # Custom React hooks
├── layouts/          # Dashboard layouts and wrappers
├── pages/            # Application pages
├── routes/           # React Router route configuration
├── socket/           # Socket.io setup
├── store/            # Redux store and slices
├── utils/            # Helper utilities
└── main.jsx
```

### 🧱 Reusable Component System

The frontend is heavily componentized.

Shared UI modules include:

```text
components/
├── AppShell/
├── Sidebar/
├── Navbar/
├── Loader/
├── Modal/
├── ClaimCard/
├── NotificationPanel/
├── TokenQrCard/
├── QrScannerModal/
├── LiveMapPanel/
└── ChatWindow/
```

Benefits:

- Reusability
- Cleaner codebase
- Easier maintenance
- Scalable UI architecture

---

## 👥 Multi-Role Dashboard System

Each role has dedicated UI workflows.

### 🍴 Restaurant Dashboard

Restaurants can:

- Upload food donations
- Monitor volunteer arrival
- Generate QR handoff tokens
- Track delivery progress
- View active rescue claims

### 🏢 NGO Dashboard

NGOs can:

- Browse nearby donations
- Accept food requests
- Monitor delivery tracking
- Verify final handoff
- Access delivery history

### 🚴 Volunteer Dashboard

Volunteers can:

- View nearby rescue requests
- Preview routes
- Accept delivery claims
- Stream live location
- Complete QR verification

### 🛡️ Admin Dashboard

Admins can monitor:

- Active deliveries
- User activity
- Claim disputes
- Platform analytics
- System integrity

---

## 🔐 Authentication & Access Control
### 🔑 JWT Authentication

Authentication state is persisted securely using JWT tokens.

Frontend handles:

- Token storage
- Protected route access
- Session persistence
- Auto logout handling

### 🛡️ Role-Based Protected Routes

Protected routes prevent unauthorized access.

Example:

```jsx
<Route
   path="/admin"
   element={
      <ProtectedRoute role="admin">
         <AdminDashboard />
      </ProtectedRoute>
   }
/>
```

---

## 📣 Notification System
### 🔔 React Toastify

The frontend provides instant feedback using React Toastify.

Notifications include:

- Claim updates
- Delivery status changes
- Verification success/failure
- Real-time alerts
- Error handling

---

## 📋 Form Handling & Validation
### 🧾 React Hook Form

Forms are optimized using React Hook Form.

Used for:

- Login/Register forms
- Food upload forms
- NGO verification forms
- Volunteer onboarding

Benefits:

- Better performance
- Minimal re-renders
- Easy validation
- Cleaner form logic

---

## 🎬 User Experience & Animations
### ✨ Framer Motion

Framer Motion improves interface responsiveness with smooth animations.

Animated elements include:

- Dashboard transitions
- Claim cards
- Notifications
- Modals
- Route panels

This creates a polished user experience.

---

## 📱 Responsive Design Philosophy

The application follows a fully responsive mobile-first architecture.

Supported devices:

- 📱 Mobile
- 💻 Desktop
- 📟 Tablets

The logistics dashboards adapt dynamically across screen sizes.

---

## 🧠 Real-World Frontend Challenges Solved

### ❌ Stale UI States
**Problem:**
Real-time delivery systems often show outdated claim data.

**Solution:**
Socket-driven synchronized state updates using Redux.

### ❌ Delivery Tracking Lag
**Problem:**
Polling-based tracking introduces delays.

**Solution:**
Persistent WebSocket geolocation streaming.

### ❌ QR Verification Complexity
**Problem:**
Secure physical handoff verification is difficult.

**Solution:**
Integrated QR scanning and token validation system.

### ❌ Large State Synchronization
**Problem:**
Managing claims, tracking, maps, and notifications becomes complex.

**Solution:**
Centralized Redux Toolkit architecture.

---

## 📈 Frontend Scalability Considerations

The frontend architecture was designed for future scaling.

Potential improvements:

- React Query integration
- Service Worker offline support
- Push notification support
- Microfrontend architecture
- Redis-backed socket scaling
- PWA optimization
- AI-powered dispatch UI

---

## 🚀 Technical Highlights
- ✔ React 19 + Vite architecture
- ✔ Real-time Socket.io communication
- ✔ Mapbox geospatial integration
- ✔ QR-based verification workflows
- ✔ Redux global state synchronization
- ✔ Multi-role dashboard architecture
- ✔ Responsive Tailwind design system
- ✔ Production-grade frontend structure

---

## 📌 Conclusion

The ResQmeal frontend is not a simple React dashboard.

It is a real-time logistics-oriented frontend ecosystem engineered with scalable architectural patterns and production-grade frontend engineering practices.

The project demonstrates:

- Advanced React engineering
- Real-time system synchronization
- Geospatial UI architecture
- Secure QR workflows
- Complex state management
- Responsive multi-role dashboard design
- Event-driven frontend communication

It reflects the complexity of real-world logistics and dispatch platforms while solving a meaningful social problem through technology.