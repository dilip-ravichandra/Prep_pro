# PrepPro 🚀
**Full 3-Round Mock Interview Platform | Java Spring Boot + MongoDB + React**

---

## 📁 Project Structure
```
interviewsim/
├── backend/                      ← Java Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/interviewsim/
│       ├── InterviewSimApplication.java
│       ├── models/               ← MongoDB Documents (OOPs Models)
│       │   ├── User.java         ← Encapsulation demo
│       │   ├── BaseResult.java   ← Abstraction + Inheritance
│       │   └── Results.java      ← Polymorphism (3 subclasses)
│       ├── repositories/         ← MongoDB Repository layer
│       ├── services/             ← Business logic
│       │   ├── AuthService.java
│       │   └── RoundServices.java
│       ├── controllers/          ← REST API endpoints
│       ├── security/             ← JWT Filter + Util
│       ├── config/               ← Security config + CORS
│       ├── dto/                  ← Request/Response DTOs
│       └── exceptions/           ← Global error handling
│
└── frontend/                     ← React 18
    ├── public/index.html
    └── src/
        ├── api/client.js         ← Axios + JWT interceptor
        ├── context/
        │   ├── AuthContext.js    ← Global auth state
        │   └── ResultsContext.js ← Global results state
        ├── components/
        │   ├── UI.js             ← Reusable components
        │   ├── Sidebar.js
        │   ├── DashboardLayout.js
        │   └── ProtectedRoute.js
        ├── pages/
        │   ├── Landing.js
        │   ├── Auth.js           ← Login + Register
        │   ├── Dashboard.js
        │   ├── AptitudeRound.js
        │   ├── TechnicalRound.js
        │   └── OtherPages.js     ← Behavioral, Results, Analytics, Leaderboard, Profile
        ├── styles/global.css
        └── App.js                ← Router
```

---

## ⚙️ Setup — Things YOU Need to Do

### Step 1: MongoDB
**Option A — MongoDB Atlas (Cloud, Recommended)**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (free tier is fine)
3. Click "Connect" → "Connect your application"
4. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
5. Open `backend/src/main/resources/application.properties`
6. Replace the URI:
   ```
   spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/interviewsim
   ```

**Option B — Local MongoDB**
1. Install MongoDB Community: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB: `mongod --dbpath /data/db`
3. The default URI in application.properties already works: `mongodb://localhost:27017/interviewsim`

---

### Step 2: JWT Secret Key
Open `backend/src/main/resources/application.properties` and update:
```
app.jwt.secret=YourSuperLongSecretKeyHereAtLeast256BitsLong2025
```
Make it at least 32 characters long. Keep it secret!

---

### Step 3: Java 17
Make sure Java 17+ is installed:
```bash
java -version
```
If not installed: [https://adoptium.net/](https://adoptium.net/)

---

### Step 4: Node.js
Make sure Node.js 18+ is installed:
```bash
node -v
```
If not installed: [https://nodejs.org/](https://nodejs.org/)

---

## 🚀 Running the Application

### Backend (Spring Boot)
```bash
cd interviewsim/backend
./mvnw spring-boot:run
```
Or on Windows:
```bash
mvnw.cmd spring-boot:run
```
Backend runs at: **http://localhost:8080**

You should see:
```
╔══════════════════════════════════════════╗
║   PrepPro Backend Running ✓              ║
║   http://localhost:8080                   ║
╚══════════════════════════════════════════╝
```

### Frontend (React)
```bash
cd interviewsim/frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, get JWT |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/aptitude/questions | ✅ | Get 10 questions |
| POST | /api/aptitude/submit | ✅ | Submit answers |
| GET | /api/technical/problems | ✅ | Get 3 problems |
| POST | /api/technical/run | ✅ | Run code |
| POST | /api/technical/submit | ✅ | Submit all code |
| GET | /api/behavioral/questions | ✅ | Get 6 questions |
| POST | /api/behavioral/submit | ✅ | Submit responses |
| GET | /api/leaderboard | ✅ | Get rankings |

---

## 🔷 OOPs Architecture (For Your Professor)

### 1. Encapsulation
- `User.java`: All fields private, accessed via Lombok @Data getters/setters
- Password is BCrypt-hashed and NEVER returned in API responses
- `JwtUtil.java`: Key management hidden, only `generateToken()` and `isTokenValid()` exposed

### 2. Inheritance
- `BaseResult.java` (abstract) is extended by:
  - `AptitudeResult.java`
  - `TechnicalResult.java`
  - `BehavioralResult.java`
- All three inherit `calculateGrade()` and `calculatePercentage()` from BaseResult

### 3. Polymorphism
- `evaluate()` method is overridden in each Result subclass:
  - `AptitudeResult.evaluate()` → counts correct MCQ answers
  - `TechnicalResult.evaluate()` → counts solved problems
  - `BehavioralResult.evaluate()` → averages AI confidence scores
- Same method name, completely different behavior (runtime polymorphism)

### 4. Abstraction
- `BaseResult` is abstract — cannot be instantiated directly
- Service layer hides all MongoDB/JWT complexity from controllers
- Controllers only call `register()`, `login()`, `evaluate()` — don't know HOW they work

---

## 🛡️ Security Features
- BCrypt password hashing (strength 12)
- JWT tokens (24-hour expiry)
- Stateless authentication (no server sessions)
- Auto-logout on 401 responses
- CORS restricted to localhost:3000
- Password never returned in any API response
- Global exception handler prevents stack trace leaks

---

## 🎨 Frontend Pages
| Route | Page | Auth |
|-------|------|------|
| / | Landing | Public |
| /login | Login | Public |
| /register | Register | Public |
| /dashboard | Dashboard | Protected |
| /aptitude | Aptitude Round | Protected |
| /technical | Technical Round | Protected |
| /behavioral | Behavioral Round | Protected |
| /aptitude/result | Aptitude Result | Protected |
| /technical/result | Technical Result | Protected |
| /behavioral/result | Behavioral Result | Protected |
| /analytics | Analytics | Protected |
| /leaderboard | Leaderboard | Protected |
| /profile | Profile | Protected |

---

## 📝 Notes
- The frontend works standalone even without the backend (uses fallback data)
- To connect frontend to backend, ensure both are running simultaneously
- MongoDB collections are auto-created on first use (no manual schema setup needed)
