# Smart Aquarium API Documentation

## Overview
This API allows communication between the Smart Aquarium Frontend, the Backend Server, and the IoT Device (ESP32). It provides endpoints for monitoring sensor data, controlling device state (pump, lights, feeder), and managing system status.

## Base URL
- **Local**: `http://localhost:3000/api`
- **Production**: `https://smart-aquarium-web.vercel.app/api`

## Authentication
Protected endpoints require a valid Supabase JWT Token.
- **Header**: `Authorization: Bearer <TOKEN>`

---

## 1. Sensors (`/api/sensors`)

### Get Latest Readings
Returns the most recent sensor values and current device state.
- **Endpoint**: `GET /latest`
- **Access**: Public
- **Response**:
  ```json
  {
    "temperature": 26.5,
    "brightness": 80,
    "water_level": 85,
    "pump_status": "ON",
    "feeding": {
      "next_feeding": "2024-03-20T14:00:00Z",
      "interval": "24h",
      "quantity": 2,
      "last_fed": "2024-03-19T14:00:00Z"
    },
    "last_updated": "2024-03-20T10:30:00Z",
    "last_pump_toggle": "2024-03-20T08:15:00Z"
  }
  ```

### Get Sensor History
Returns historical sensor data for charting.
- **Endpoint**: `GET /history`
- **Access**: Public
- **Query Parameters**:
  - `range` (optional): `24h` (default), `7d`, `30d`
- **Response**:
  ```json
  {
    "data": [
      {
        "created_at": "2024-03-20T10:00:00Z",
        "temperature": 26.5,
        "water_level": 85
      },
      ...
    ]
  }
  ```

### Upload Sensor Data (IoT Device)
Used by the ESP32 to push new readings.
- **Endpoint**: `POST /upload`
- **Access**: Public (Internal Network)
- **Behavior**: 
  - Automatically triggers **Air Pump ON** if `temperature > 28.0°C` and pump is currently OFF.
- **Body**:
  ```json
  {
    "temperature": 26.5,
    "water_level": 90
  }
  ```
- **Response**: `{ "success": true }`

---

## 2. Control (`/api/control`)

All Control endpoints require **Admin Authentication**.

### Toggle Air Pump
Turn the air pump ON or OFF.
- **Endpoint**: `POST /pump`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Body**:
  ```json
  { "state": true }  // true = ON, false = OFF
  ```
- **Response**:
  ```json
  {
    "status": "queued",
    "command": { "type": "PUMP", "value": true }
  }
  ```

### Trigger Feeding
Trigger an immediate feeding cycle.
- **Endpoint**: `POST /feed`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Body**: `{ "action": "FEED" }`
- **Response**:
  ```json
  {
    "status": "queued",
    "next_feeding_at": "2024-03-20T15:00:00Z" 
  }
  ```
  *Note: Triggering a manual feed resets the schedule based on the query time (Time + Interval).*

### Set Brightness
Adjust the LED light brightness (0-100).
- **Endpoint**: `POST /brightness`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Body**:
  ```json
  { "value": 75 }
  ```
- **Response**:
  ```json
  {
    "status": "queued",
    "command": { "type": "LIGHT", "value": 75 }
  }
  ```

### Update Feeding Settings
Configure automatic feeding schedule.
- **Endpoint**: `POST /feeding-settings`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Body**:
  ```json
  {
    "interval": "12 Hours",
    "quantity": 2
  }
  ```
- **Response**: 
  ```json
  { 
    "success": true, 
    "next_feeding_at": "2024-03-20T15:00:00Z" 
  }
  ```

### Get Latest Command (IoT Device)
Used by ESP32 to poll for pending commands. Fetches from the persistent `command_queue` table.
- **Endpoint**: `GET /latest`
- **Behavior**: 
  - **Expiration**: Commands older than **10 minutes** are automatically marked as processed and ignored.
  - **Superseding**: New commands cancel previous unprocessed commands of the same type.
- **Response**:
  ```json
  {
    "has_command": true,
    "command": {
      "type": "PUMP",
      "value": "ON"
    }
  }
  ```

---

## 3. System (`/api/system`)

### Get System Status
Check if the backend and database are reachable.
- **Endpoint**: `GET /status`
- **Access**: Public
- **Response**:
  ```json
  {
    "esp32_online": true,
    "last_seen": "2024-03-20T10:30:00Z"
  }
  ```

---

## 4. Authentication (`/api/auth`)

### Check User Role
Verify if a user has Admin privileges by checking the `admin_users` whitelist.
- **Endpoint**: `GET /role/:userId`
- **Access**: Public
- **Response**:
  ```json
  { "role": "admin" } // or "viewer"
  ```
