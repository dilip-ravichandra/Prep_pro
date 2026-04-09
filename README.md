<div align="center">

<img src="https://img.shields.io/badge/PrepPro-Interview%20Platform-0f172a?style=for-the-badge&logoColor=white" alt="PrepPro" />

# 🎯 PrepPro
### *Mock Interview Platform · OOP in Action*

**A full-stack interview simulation platform built to demonstrate Object-Oriented Programming in Java through a real-world, production-grade application.**

<br/>

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

<br/>

> _Formerly InterviewSimPro — rebranded to **PrepPro** for a more candidate-first identity._

</div>

---

## 📌 Table of Contents

1. [What is PrepPro?](#-what-is-prepPro)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture Overview](#-architecture-overview)
5. [How This Project Teaches OOP in Real Life](#-how-this-project-teaches-oop-in-real-life)
6. [Backend Request Flow](#-backend-request-flow)
7. [Folder Structure](#-folder-structure)
8. [Installation & Setup](#-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [Running the Application](#-running-the-application)
11. [API Overview](#-api-overview)
12. [Usage Flow](#-usage-flow)
13. [Security Notes](#-security-notes)
14. [Contributing](#-contributing)
15. [License](#-license)

---

## 🧠 What is PrepPro?

**PrepPro** is a full-stack mock interview simulation platform that guides candidates through a structured, three-round interview experience — entirely online, entirely automated, and powered by AI-assisted tools.

It is designed with a dual purpose:

- **For candidates** — A realistic, pressure-tested interview environment with randomized questions, timed rounds, and instant feedback.
- **For developers & students** — A clean, well-structured Java Spring Boot codebase that demonstrates all four pillars of **Object-Oriented Programming** in a real application context.

> 💡 If you're studying OOP and want to see how encapsulation, abstraction, inheritance, and polymorphism are applied *in production-style code* — not toy examples — PrepPro is for you.

---

## ✨ Features

### 👤 Candidate Experience
- 🔐 Secure registration, login, and JWT-authenticated sessions
- 📋 Three structured interview rounds: **Aptitude → Technical Coding → Behavioral**
- 🎲 Randomized questions drawn from admin-curated question banks
- 🤖 AI-powered in-round assistance (contextual hints and explanations)
- 📊 Result tracking across all rounds
- 🔑 Self-service forgot-password and reset-password flows

### 🛠️ Admin Panel
- 📁 Full question bank CRUD (create, read, update, delete)
- 🏷️ Organize questions by category, round type, and difficulty
- 🤖 AI-assisted question generation from a topic prompt
- 📈 View candidate progress and results
- 🔑 Dedicated admin forgot-password and reset-password flow
- 🔒 Role-based access control — admins cannot access candidate routes and vice versa

### 🏗️ Platform Architecture
- Role-based authentication (`ADMIN` / `CANDIDATE`) with Spring Security + JWT
- Stateless REST API, fully decoupled from the React frontend
- Extensible result model hierarchy designed to showcase OOP
- MongoDB for flexible, schema-light document storage

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.x |
| **Database** | MongoDB (Atlas or local) |
| **Auth** | Spring Security + JWT (JJWT) |
| **AI Features** | External LLM API (pluggable) |
| **Frontend** | React 18, Axios, React Router |
| **Build Tools** | Maven (backend), npm / Vite (frontend) |
| **Dev Tools** | Postman, MongoDB Compass |

---

## 🏛 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PrepPro Platform                        │
│                                                                 │
│  ┌──────────────┐         ┌───────────────────────────────┐    │
│  │   React UI   │ ──────▶ │    Spring Boot REST API        │    │
│  │  (Frontend)  │ ◀────── │    (Java 17 · Port 8080)      │    │
│  └──────────────┘  HTTP   └───────────┬───────────────────┘    │
│                            JWT Auth   │                          │
│                                       │                          │
│                       ┌──────────────▼──────────────┐           │
│                       │         MongoDB               │           │
│                       │  users · questions · results  │           │
│                       └─────────────────────────────-┘           │
│                                       │                          │
│                       ┌──────────────▼──────────────┐           │
│                       │      AI Assistant API         │           │
│                       │  (Question Gen · Chat Help)   │           │
│                       └──────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**Three-Round Interview Flow:**

```
[Candidate Logs In]
        │
        ▼
 ┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
 │  Round 1    │ ──▶ │    Round 2       │ ──▶ │   Round 3      │
 │  Aptitude   │     │Technical Coding  │     │  Behavioral    │
 │  (MCQ/Quiz) │     │(Problem Solving) │     │(Open-ended QA) │
 └─────────────┘     └──────────────────┘     └────────────────┘
        │                    │                        │
        ▼                    ▼                        ▼
  AptitudeResult      TechnicalResult          BehavioralResult
        │                    │                        │
        └────────────────────┴────────────────────────┘
                             │
                             ▼
                     InterviewResult (base)
```

---

## 🎓 How This Project Teaches OOP in Real Life

PrepPro is intentionally architected to demonstrate all four OOP pillars using patterns that appear in real enterprise Java applications — not contrived textbook examples.

---

### 🔒 1. Encapsulation — *"Hide the data, expose behavior"*

> **Principle:** Bundle data with the methods that operate on it. Never expose raw fields directly.

**Where it appears in PrepPro:**

Every entity (`Candidate`, `Admin`, `Question`, `InterviewResult`) is a Java class with:
- All fields declared **`private`**
- Controlled access via **getters and setters** (or Lombok `@Data`)
- Business logic that operates on the data lives *inside* the class or its paired service

```java
// ✅ Encapsulation in the Candidate entity
public class Candidate {
    private String id;
    private String email;
    private String hashedPassword;   // raw password NEVER stored
    private String fullName;
    private List<String> completedRounds;

    // Behavior tied to data
    public boolean hasCompletedRound(String roundType) {
        return completedRounds.contains(roundType);
    }

    // No direct field access — all via getters/setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

**DTOs enforce encapsulation at the API boundary:**

```java
// Internal model — rich, with sensitive fields
Candidate candidate = candidateService.findById(id);

// DTO — only what the frontend needs
CandidateProfileDTO dto = new CandidateProfileDTO(
    candidate.getFullName(),
    candidate.getEmail(),
    candidate.getCompletedRounds()
    // hashedPassword is NOT included
);
```

---

### 🧩 2. Abstraction — *"Define what, hide how"*

> **Principle:** Expose a clean interface (what something does) and hide the complex implementation (how it does it).

**Where it appears in PrepPro:**

Abstract classes and interfaces separate *contracts* from *implementations*.

```java
// Abstract base service — defines WHAT all round services must do
public abstract class AbstractRoundService {
    public abstract List<Question> fetchQuestions(String candidateId);
    public abstract RoundResult evaluateSubmission(RoundSubmission submission);
    public abstract String getRoundType();

    // Shared concrete behavior (used by all rounds)
    public void validateSubmission(RoundSubmission submission) {
        if (submission == null || submission.getAnswers().isEmpty()) {
            throw new InvalidSubmissionException("Submission cannot be empty.");
        }
    }
}
```

Implementations (`AptitudeRoundService`, `TechnicalRoundService`, `BehavioralRoundService`) define *how* each round evaluates answers — but callers only interact with `AbstractRoundService`.

AI-powered features are abstracted behind an interface:

```java
public interface AIAssistantService {
    String generateHint(String questionText);
    List<Question> generateQuestionsFromTopic(String topic, int count);
    String answerCandidateQuery(String query, String context);
}
```

The actual LLM provider can be swapped without touching any round logic.

---

### 🧬 3. Inheritance — *"Build on what exists, extend what differs"*

> **Principle:** Share common structure and behavior in a base class; let subclasses specialize.

**Where it appears in PrepPro — the Result Model Hierarchy:**

```
                    ┌───────────────────────┐
                    │    InterviewResult     │  ← Base class
                    │  - candidateId         │
                    │  - roundType           │
                    │  - submittedAt         │
                    │  - score               │
                    │  + getSummary()        │
                    └──────────┬────────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                  ▼
  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐
  │  AptitudeResult  │  │TechnicalResult│  │ BehavioralResult  │
  │  - correctCount  │  │ - testCases  │  │ - competencyScores│
  │  - wrongCount    │  │ - codeSnippet│  │ - evaluationNotes │
  │  + getSummary()  │  │ + getSummary()│  │ + getSummary()    │
  └──────────────────┘  └──────────────┘  └───────────────────┘
```

```java
// Base class
public abstract class InterviewResult {
    protected String candidateId;
    protected String roundType;
    protected LocalDateTime submittedAt;
    protected double score;

    public abstract String getSummary(); // must be overridden
    public double getScore() { return score; }
}

// Subclass — adds aptitude-specific fields
public class AptitudeResult extends InterviewResult {
    private int correctCount;
    private int wrongCount;

    @Override
    public String getSummary() {
        return String.format("Aptitude: %d correct, %d wrong. Score: %.1f%%",
            correctCount, wrongCount, score);
    }
}
```

---

### 🔀 4. Polymorphism — *"One interface, many behaviors"*

> **Principle:** The same method call behaves differently based on the actual object type at runtime.

**Where it appears in PrepPro — result evaluation and rendering:**

```java
// All three result types can be treated as InterviewResult
List<InterviewResult> results = resultService.getResultsForCandidate(candidateId);

// Polymorphic dispatch — each subclass runs its own getSummary()
for (InterviewResult result : results) {
    System.out.println(result.getSummary());
    // AptitudeResult    → "Aptitude: 18 correct, 2 wrong. Score: 90.0%"
    // TechnicalResult   → "Technical: 4/5 test cases passed. Score: 80.0%"
    // BehavioralResult  → "Behavioral: Leadership 4/5, Communication 5/5. Score: 90.0%"
}
```

The `RoundServiceFactory` uses polymorphism to dispatch to the correct service:

```java
public class RoundServiceFactory {
    private final Map<String, AbstractRoundService> serviceMap;

    public RoundServiceFactory(
        AptitudeRoundService aptitude,
        TechnicalRoundService technical,
        BehavioralRoundService behavioral
    ) {
        serviceMap = Map.of(
            "APTITUDE",   aptitude,
            "TECHNICAL",  technical,
            "BEHAVIORAL", behavioral
        );
    }

    // Polymorphic lookup — caller doesn't know which concrete service runs
    public AbstractRoundService getService(String roundType) {
        return serviceMap.get(roundType.toUpperCase());
    }
}
```

---

### 📊 OOP Concept → PrepPro Mapping Summary

| OOP Pillar | PrepPro Implementation |
|---|---|
| **Encapsulation** | `Candidate`, `Question`, `Admin` entities with private fields + getters/setters; DTOs at API boundary |
| **Abstraction** | `AbstractRoundService`, `AIAssistantService` interface, Spring `@Repository` hiding MongoDB queries |
| **Inheritance** | `InterviewResult` → `AptitudeResult`, `TechnicalResult`, `BehavioralResult` |
| **Polymorphism** | `getSummary()` override per result type; `RoundServiceFactory` dispatching by round type |

---

## 🔄 Backend Request Flow

```
                    HTTP Request (e.g. POST /api/rounds/aptitude/submit)
                              │
                              ▼
                    ┌──────────────────┐
                    │  Security Filter  │   ← JWT extracted & validated
                    │  (JwtAuthFilter)  │
                    └────────┬─────────┘
                             │ Principal injected
                             ▼
                    ┌──────────────────┐
                    │    Controller     │   ← Maps HTTP → service call
                    │ (RoundController) │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │  RoundServiceFactory  │   ← Polymorphic dispatch
                    └────────┬─────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ AbstractRoundService  │   ← validate + evaluate
                    │  (concrete subclass)  │
                    └────────┬─────────────┘
                             │
                     ┌───────┴────────┐
                     ▼               ▼
              ┌────────────┐   ┌──────────────┐
              │ Repository │   │ AIAssistant  │
              │  (MongoDB) │   │   Service    │
              └────────────┘   └──────────────┘
                     │
                     ▼
              Saved InterviewResult (subclass)
                     │
                     ▼
              DTO Response → HTTP 200
```

---

## 📂 Folder Structure

```
PrepPro/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/prepPro/
│   │   ├── config/                   # Security, JWT, CORS config
│   │   ├── controller/               # REST controllers (Admin, Candidate, Round, Auth)
│   │   ├── dto/                      # Request/Response DTOs (encapsulation boundary)
│   │   ├── entity/                   # Domain models (Candidate, Admin, Question)
│   │   ├── result/                   # OOP result hierarchy
│   │   │   ├── InterviewResult.java  # Abstract base
│   │   │   ├── AptitudeResult.java
│   │   │   ├── TechnicalResult.java
│   │   │   └── BehavioralResult.java
│   │   ├── repository/               # MongoDB repositories (Spring Data)
│   │   ├── service/                  # Business logic
│   │   │   ├── AbstractRoundService.java
│   │   │   ├── AptitudeRoundService.java
│   │   │   ├── TechnicalRoundService.java
│   │   │   ├── BehavioralRoundService.java
│   │   │   └── RoundServiceFactory.java
│   │   ├── ai/                       # AI assistant abstraction layer
│   │   └── PrepProApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── pages/                    # Candidate & Admin page components
│   │   ├── components/               # Reusable UI components
│   │   ├── services/                 # Axios API wrappers
│   │   ├── context/                  # Auth context (JWT storage)
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java JDK | 17+ | [Download](https://adoptium.net/) |
| Maven | 3.8+ | Bundled with most IDEs |
| Node.js | 18+ | [Download](https://nodejs.org/) |
| MongoDB | 6.x+ | Local or [Atlas free tier](https://www.mongodb.com/atlas) |
| Git | Any | [Download](https://git-scm.com/) |

### Clone the Repository

```bash
git clone https://github.com/your-username/PrepPro.git
cd PrepPro
```

---

## 🔑 Environment Variables

### Backend — `backend/src/main/resources/application.properties`

```properties
# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/prepPro
# or for Atlas:
# spring.data.mongodb.uri=mongodb+srv://<user>:<password>@cluster.mongodb.net/prepPro

# JWT
jwt.secret=your_super_secret_key_min_256_bits
jwt.expiration.ms=86400000

# AI Assistant (pluggable)
ai.api.key=your_ai_api_key
ai.api.base-url=https://api.your-llm-provider.com

# Server
server.port=8080
```

> ⚠️ **Never commit real secrets.** Use a `.env` file or your IDE's environment variable settings. Add `application.properties` to `.gitignore` if it contains secrets.

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🚀 Running the Application

### Backend

**Windows (Command Prompt / PowerShell):**
```cmd
cd backend
mvnw.cmd spring-boot:run
```

**macOS / Linux:**
```bash
cd backend
./mvnw spring-boot:run
```

The API will start at `http://localhost:8080`.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app will start at `http://localhost:5173`.

---

## 📡 API Overview

### Authentication

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/candidate/register` | Public | Candidate registration |
| `POST` | `/api/auth/candidate/login` | Public | Candidate login → JWT |
| `POST` | `/api/auth/admin/login` | Public | Admin login → JWT |
| `POST` | `/api/auth/candidate/forgot-password` | Public | Send reset email |
| `POST` | `/api/auth/candidate/reset-password` | Public | Reset with token |
| `POST` | `/api/auth/admin/forgot-password` | Public | Admin reset email |
| `POST` | `/api/auth/admin/reset-password` | Public | Admin reset with token |

### Candidate — Interview Rounds

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/rounds/aptitude/questions` | Candidate | Fetch randomized aptitude questions |
| `POST` | `/api/rounds/aptitude/submit` | Candidate | Submit aptitude answers |
| `GET` | `/api/rounds/technical/questions` | Candidate | Fetch technical coding questions |
| `POST` | `/api/rounds/technical/submit` | Candidate | Submit code/answers |
| `GET` | `/api/rounds/behavioral/questions` | Candidate | Fetch behavioral questions |
| `POST` | `/api/rounds/behavioral/submit` | Candidate | Submit behavioral responses |
| `GET` | `/api/candidate/results` | Candidate | View all round results |

### Admin — Question Bank

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/questions` | Admin | List all questions |
| `POST` | `/api/admin/questions` | Admin | Add a question manually |
| `PUT` | `/api/admin/questions/{id}` | Admin | Update a question |
| `DELETE` | `/api/admin/questions/{id}` | Admin | Delete a question |
| `POST` | `/api/admin/questions/generate` | Admin | AI-generate questions from topic |
| `GET` | `/api/admin/candidates` | Admin | View all candidates |
| `GET` | `/api/admin/results/{candidateId}` | Admin | View a candidate's results |

> All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🗺 Usage Flow

### Admin Flow

```
1. Admin logs in → receives JWT
2. Navigates to Question Bank
3. Creates/edits questions per round type (Aptitude / Technical / Behavioral)
4. Optionally uses AI Question Generator to bulk-create from a topic
5. Monitors candidate results from the dashboard
```

### Candidate Flow

```
1. Candidate registers + logs in → receives JWT
2. Starts Round 1: Aptitude
   └─ Receives randomized MCQs from admin question bank
   └─ Submits answers → AptitudeResult saved
3. Proceeds to Round 2: Technical Coding
   └─ Receives randomized coding problems
   └─ Can use AI hint assistant during the round
   └─ Submits code/answers → TechnicalResult saved
4. Proceeds to Round 3: Behavioral
   └─ Receives open-ended behavioral questions
   └─ Submits responses → BehavioralResult saved
5. Views consolidated results with round-wise scores and feedback
```

---

## 🔐 Security Notes

- **Passwords** are hashed using **BCrypt** before storage. Raw passwords are never persisted.
- **JWT tokens** are signed with a server-side secret and have a configurable expiry (default: 24 hours).
- **Role-based access control** is enforced at the Spring Security filter level — a candidate JWT cannot access admin endpoints, and vice versa.
- **Password reset tokens** are single-use, time-limited tokens stored securely and invalidated after use.
- **DTOs** ensure that internal entity fields (e.g., `hashedPassword`) are never accidentally exposed in API responses.
- **CORS** is configured to only accept requests from the known frontend origin.

> For production deployment, set `jwt.secret` to a cryptographically random 256-bit+ value and use MongoDB Atlas with IP allowlisting.

---

## 🤝 Contributing

Contributions are welcome! PrepPro is an academic portfolio project, and clean, well-documented code is a priority.

**Steps to contribute:**

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/your-username/PrepPro.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes with clear commit messages
git commit -m "feat: add timing tracker to TechnicalRound"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

**Guidelines:**
- Follow existing package structure and naming conventions
- New round types should extend `AbstractRoundService` and `InterviewResult` — maintaining the OOP hierarchy
- Write self-documenting code; add Javadoc to public methods
- Keep PRs focused — one feature or fix per PR

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License · Copyright (c) 2025 PrepPro Contributors
```

---

<div align="center">

**PrepPro** — *Built to learn. Designed to impress.*

Made with ☕ in Java · Powered by Spring Boot · Demonstrated with Purpose

</div>
