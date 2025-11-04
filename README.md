# Screen Time Tracker App

## 🚀 Quick Start

### 1. Install App Dependencies
```bash
npm install
```

### 2. Install ML Backend Dependencies
```bash
cd ../mlmodel
pip install -r requirements.txt
```

### 3. Start ML Backend Server
```bash
cd ../mlmodel
python start_server.py
```

### 4. Run the App
```bash
cd ../StickerSmash
npx expo run:android
```

### Alternative: Start Development Server
```bash
npm start
```

## 📋 Requirements

**Frontend:**
- Node.js
- Android Studio (for Android)
- Xcode (for iOS)
- Expo CLI

**Backend:**
- Python 3.8+
- pip (Python package manager)

## 🔧 Setup

1. Clone the project
2. Install app dependencies: `npm install`
3. Install Python dependencies: `cd ../mlmodel && pip install -r requirements.txt`
4. Start ML server: `python start_server.py` (in mlmodel folder)
5. Run the app: `npx expo run:android` (in StickerSmash folder)

## ✨ Features

- Real-time screen time tracking
- ML-powered addiction insights
- Voice notifications
- App blocking
- Virtual pet companion
- Rewards system
- Games and activities

## 📱 Permissions Required

- Usage Stats Access
- Notification Permission
- Accessibility Service (for app blocking)

## 💡 Important Notes

- `npm install` installs **JavaScript/React Native** dependencies only
- `pip install -r requirements.txt` installs **Python/ML** dependencies separately
- Both frontend and backend must be running for full functionality
- ML server runs on port 8001

---

Built with React Native & Expo + Python ML Backend
