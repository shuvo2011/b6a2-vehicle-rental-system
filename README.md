
# 🚗 Vehicle Rental System (Backend API)

A backend REST API for a **Vehicle Rental System** built with **Node.js, TypeScript, Express, and PostgreSQL**.  
This project implements role-based authentication, vehicle management, user management, and booking workflows following a **modular architecture**.

---

## 🔗 Live API
**Base URL:**  
https://b6a2-vehicle-rental-system.vercel.app

## 🔗 GitHub Repository
https://github.com/shuvo2011/b6a2-vehicle-rental-system

---

## 🎯 Project Overview
This system handles:

- **Vehicles** – Manage vehicle inventory with availability tracking  
- **Users** – Manage customer and admin accounts  
- **Bookings** – Handle rentals, cancellations, returns, and cost calculation  
- **Authentication & Authorization** – Secure JWT-based role access (Admin & Customer)

---

## 🛠 Technology Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **PostgreSQL**
- **bcrypt** – Password hashing
- **jsonwebtoken (JWT)** – Authentication

---

## 📁 Code Structure

```
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── vehicle/
│   └── booking/
├── server.ts
```

> The project follows a **feature-based modular pattern** with proper separation of routes, controllers, and services.

---

## 📊 Database Tables

### Users
| Field | Notes |
|------|------|
| id | Auto-generated |
| name | Required |
| email | Required, unique, lowercase |
| password | Required, min 6 characters |
| phone | Required |
| role | `admin` or `customer` |

### Vehicles
| Field | Notes |
|------|------|
| id | Auto-generated |
| vehicle_name | Required |
| type | `car`, `bike`, `van`, `SUV` |
| registration_number | Required, unique |
| daily_rent_price | Required, positive |
| availability_status | `available` or `booked` |

### Bookings
| Field | Notes |
|------|------|
| id | Auto-generated |
| customer_id | Links to Users table |
| vehicle_id | Links to Vehicles table |
| rent_start_date | Required |
| rent_end_date | Required, must be after start date |
| total_price | Required, positive |
| status | `active`, `cancelled`, `returned` |

---

## 🔐 Authentication & Authorization

### User Roles
- **Admin**
  - Manage vehicles, users, and all bookings
- **Customer**
  - Register, view vehicles, create & manage own bookings

### Authentication Flow
1. Passwords are hashed using **bcrypt**
2. Login returns a **JWT token**
3. Protected routes require:
   ```
   Authorization: Bearer <token>
   ```
4. Role-based authorization enforced via middleware
5. Unauthorized access returns **401 / 403**

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Access |
|------|---------|-------|
| POST | `/api/v1/auth/signup` | Public |
| POST | `/api/v1/auth/signin` | Public |

### Vehicles
| Method | Endpoint | Access |
|------|---------|-------|
| POST | `/api/v1/vehicles` | Admin |
| GET | `/api/v1/vehicles` | Public |
| GET | `/api/v1/vehicles/:vehicleId` | Public |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin (if no active bookings) |

### Users
| Method | Endpoint | Access |
|------|---------|-------|
| GET | `/api/v1/users` | Admin |
| PUT | `/api/v1/users/:userId` | Admin or Own |
| DELETE | `/api/v1/users/:userId` | Admin (if no active bookings) |

### Bookings
| Method | Endpoint | Access |
|------|---------|-------|
| POST | `/api/v1/bookings` | Customer / Admin |
| GET | `/api/v1/bookings` | Role-based |
| PUT | `/api/v1/bookings/:bookingId` | Role-based |

---

## ⚠️ Important Notes
- All endpoints strictly follow assignment specifications
- Validation and authorization are enforced at middleware & service levels
- Transactions are used for booking operations to maintain data integrity


---

## ⚠️ Admin Access
email: habib@rk.com
pass: 123456

---

## ⚠️ Customer Access
email: kamal@khan.com
pass: 123456

---

## 📄 License
This project is for educational and assignment purposes.
