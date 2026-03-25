# 🎓 Campus Doubt Sharing Platform

A full-stack MERN + Angular platform where students post doubts, answer them, and vote on answers.

---

## 🗂 Project Structure

```
campus-doubt-platform/
├── backend/                  # Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js  # Aggregation query inside
│   │   ├── answerController.js
│   │   ├── voteController.js      # Full vote logic (add/switch/remove)
│   │   └── adminController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   └── Vote.js            # Unique index: userId + answerId
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── answerRoutes.js
│   │   ├── voteRoutes.js
│   │   └── adminRoutes.js
│   ├── seedAdmin.js           # Creates default admin user
│   ├── server.js
│   └── .env.example
│
├── frontend/                 # React + Zustand
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.js
│       │   │   └── Navbar.css
│       │   ├── questions/
│       │   │   ├── QuestionCard.js
│       │   │   └── QuestionCard.css
│       │   └── answers/
│       │       ├── AnswerItem.js     # Voting UI here
│       │       └── AnswerItem.css
│       ├── pages/
│       │   ├── HomePage.js
│       │   ├── QuestionDetailPage.js
│       │   ├── AskQuestionPage.js
│       │   ├── LoginPage.js
│       │   └── RegisterPage.js
│       ├── store/              # Zustand global state
│       │   ├── authStore.js
│       │   ├── questionStore.js
│       │   └── answerStore.js  # castVote() lives here
│       ├── services/
│       │   └── api.js          # Axios instance + interceptors
│       ├── App.js
│       ├── index.js
│       └── index.css           # Design system CSS variables
│
└── admin-panel/              # Angular 17 + RxJS
    └── src/app/
        ├── components/
        │   ├── auth/
        │   │   └── login.component.ts
        │   ├── layout/
        │   │   └── shell.component.ts   # Sidebar layout
        │   ├── dashboard/
        │   │   └── dashboard.component.ts  # forkJoin RxJS
        │   ├── users/
        │   │   └── users.component.ts
        │   └── questions/
        │       └── questions.component.ts  # Delete with confirm
        ├── services/
        │   ├── auth.service.ts       # BehaviorSubject pattern
        │   ├── admin.service.ts      # Observable API calls
        │   └── auth.interceptor.ts   # JWT header injection
        ├── guards/
        │   └── auth.guard.ts
        ├── models/
        │   └── models.ts
        ├── app.routes.ts
        ├── app.config.ts
        └── app.component.ts
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017`  
  _(or use MongoDB Atlas — update `MONGO_URI` in `.env`)_
- **Angular CLI** v17: `npm install -g @angular/cli`

---

## 🚀 Setup — Step by Step

### 1. Clone / open the project

```bash
cd campus-doubt-platform
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# Seed the admin user (run once)
node seedAdmin.js

# Start the dev server
npm run dev
# → Running on http://localhost:5000
```

**Test the API:**
```
GET http://localhost:5000/api/health
→ { "status": "OK", "message": "Campus Doubt API running" }
```

---

### 3. React Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
# → Running on http://localhost:3000
```

The frontend proxies `/api` to `http://localhost:5000` automatically (set in `package.json`).

---

### 4. Angular Admin Panel Setup

```bash
cd admin-panel

# Install dependencies
npm install

# Start the dev server
npm start
# → Running on http://localhost:4200
```

Login with the admin credentials you set in `.env`:
- **Email:** `admin@campus.com`
- **Password:** `admin123`

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register student |
| POST | `/api/auth/login` | ❌ | Login (student or admin) |
| GET | `/api/auth/me` | ✅ | Get current user |

### Questions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions` | ❌ | Get all questions (with answer count via aggregation) |
| GET | `/api/questions/:id` | ❌ | Get single question |
| POST | `/api/questions` | ✅ | Create question |

### Answers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/answers/:questionId` | ✅ | Get answers (with user's vote status) |
| POST | `/api/answers` | ✅ | Add answer |

### Votes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/votes` | ✅ | Cast / switch / remove vote |

### Admin (admin JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All students |
| GET | `/api/admin/questions` | All questions |
| DELETE | `/api/admin/questions/:id` | Delete question + answers + votes |
| DELETE | `/api/admin/answers/:id` | Delete answer + votes |

---

## 🧠 Zustand Store Guide

Three global stores, zero prop-drilling:

```js
// Read state
const { user } = useAuthStore();
const { questions } = useQuestionStore();
const { answers } = useAnswerStore();

// Actions
const { login, logout } = useAuthStore();
const { fetchQuestions, createQuestion } = useQuestionStore();
const { fetchAnswers, addAnswer, castVote } = useAnswerStore();
```

**Vote example (instant UI update):**
```js
// In AnswerItem.js
const { castVote } = useAnswerStore();

const handleVote = async (voteType) => {
  await castVote(answer._id, voteType);
  // Store updates answers[] immediately — no useState needed
};
```

**Vote rules implemented in `voteController.js`:**
- No existing vote → create, +1 or -1
- Same vote again → remove (toggle off), reverse score
- Different vote → switch, ±2 delta

---

## 🅰️ RxJS Patterns Used in Angular

### 1. Observable + subscribe (basic)
```typescript
// In users.component.ts
this.adminService.getUsers().subscribe({
  next: (res) => { this.users = res.data; },
  error: (err) => { console.error(err); }
});
```

### 2. BehaviorSubject (reactive state)
```typescript
// In auth.service.ts
private currentUserSubject = new BehaviorSubject<User | null>(null);
currentUser$ = this.currentUserSubject.asObservable();

// In shell.component.ts template
{{ (authService.currentUser$ | async)?.name }}
```

### 3. forkJoin (parallel requests)
```typescript
// In dashboard.component.ts
forkJoin({
  users: this.adminService.getUsers(),
  questions: this.adminService.getQuestions()
}).subscribe(({ users, questions }) => {
  this.userCount = users.data.length;
  this.questionCount = questions.data.length;
});
```

### 4. tap operator (side effects in login)
```typescript
// In auth.service.ts
return this.http.post<AuthResponse>(...).pipe(
  tap((res) => {
    localStorage.setItem('admin_token', res.token);
    this.currentUserSubject.next(res.user);
  })
);
```

---

## 🍃 MongoDB Aggregation (in questionController.js)

The `GET /api/questions` endpoint uses an aggregation pipeline to count answers per question — avoiding N+1 queries:

```js
Question.aggregate([
  // Join answers collection
  { $lookup: { from: 'answers', localField: '_id', foreignField: 'questionId', as: 'answers' } },
  // Join users for author info
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'author' } },
  // Add computed fields
  { $addFields: {
      answerCount: { $size: '$answers' },
      author: { $arrayElemAt: ['$author', 0] }
  }},
  // Project only needed fields
  { $project: { title: 1, description: 1, answerCount: 1, createdAt: 1, 'author.name': 1 } },
  { $sort: { createdAt: -1 } }
])
```

---

## 🔐 Voting Logic Summary

```
User clicks Upvote on Answer X:

1. No existing vote?
   → Create Vote doc (upvote)
   → answer.voteScore += 1

2. Already upvoted?
   → Delete Vote doc
   → answer.voteScore -= 1   (toggle off)

3. Had a downvote, now clicking upvote?
   → Update Vote doc to upvote
   → answer.voteScore += 2   (remove -1, add +1)
```

---

## 🧪 Quick Test Flow

1. Register a student at `http://localhost:3000/register`
2. Post a question via `Ask Question`
3. Open the question, write an answer
4. Upvote / downvote — watch the score change instantly
5. Click same vote again — it removes the vote
6. Login to admin panel at `http://localhost:4200`
7. View users, view questions, delete a question

---

## 🚫 Known Limitations (by design)

- No pagination (keep it simple)
- No image uploads
- No real-time updates (no WebSockets)
- No email verification
- Admin can only delete, not edit

---

## 📦 Tech Versions

| Package | Version |
|---------|---------|
| React | 18 |
| Zustand | 4 |
| Angular | 17 |
| RxJS | 7.8 |
| Express | 4.18 |
| Mongoose | 8 |
| JWT | 9 |
