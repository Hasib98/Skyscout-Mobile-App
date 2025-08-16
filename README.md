# 🌤️ Skyscout – React Native Weather App

Skyscout is a modern **React Native mobile application** that provides real-time weather data and 12-hour precipitation forecasts.  
It is built with **TypeScript** and follows **industry-standard best practices** to ensure scalability, performance, and maintainability.

---

## 🚀 Features

- 📍 **Location-based Weather**  
  Automatically fetches weather data using device geolocation (with permission handling).

- 🏙️ **City Search**  
  Allows users to search for a city and get its live weather conditions.

- ⏳ **Hourly Forecast**  
  Displays precipitation probability and other conditions for the next 12 hours.

- 🌗 **Dark/Light Mode Support**  
  Adapts seamlessly to system theme for a better user experience.

- ⚡ **Fast Refresh & Offline Storage**  
  Uses `AsyncStorage` to cache location and user preferences for quick reloads.

- 📱 **Cross-Platform**  
  Works on both **Android** and **iOS** with a consistent UI.

---

## 📦 Tech Stack

- **React Native CLI** (not Expo) – for full native integration.  
- **TypeScript** – type safety and maintainability.  
- **Open-Meteo API** – free, reliable weather API (no key required).  
- **AsyncStorage** – local persistence for caching.  
- **react-native-permissions** – fine-grained permissions for location.  
- **react-native-geolocation-service** – precise geolocation handling.  

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- Yarn or npm
- Android Studio / Xcode
- React Native CLI (`npx react-native`)

---

### 1️⃣ Clone the repository
```sh
git clone https://github.com/Hasib98/Skyscout-Mobile-App.git
cd Skyscout-Mobile-App
