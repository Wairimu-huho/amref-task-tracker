# Mini Task Tracker

A full-stack task management app built for the Amref Health Africa ICT Intern – Software Developer take-home assignment.

## What I Built

A task tracker where a user can create, view, update, and delete tasks. Each task has a title, an optional description, and a status (`To Do`, `In Progress`, `Done`). The backend is a REST API built with Express; the frontend is a React app (built with Vite) that talks to it over HTTP. Data is stored in memory on the server while it's running.

## Tech Stack & Why

**Overall choice: MERN-lite (no database)** — I’m most comfortable working with the MERN stack, so that’s what I used for this project. Since the brief allowed in-memory storage and made a database optional, I decided not to add MongoDB. This gave me more time to focus on the API, validation, and making sure the app was properly documented and working.

### Backend (`/server`)

| Package | Why |
|---|---|
| `express` (v5) | Used to build the REST API and handle routes such as `GET`, `POST`, `PUT`, and `DELETE`. I used Express 5, but the routing syntax is similar to what you see in most Express 4 tutorials. |
| `cors` | Allows the frontend (`localhost:5173`) to communicate with the backend (`localhost:5000`). Since they run on different ports, CORS is needed to allow those requests. |
| `nodemon` (dev dependency) | Automatically restarts the server when I make changes during development, so I don't have to restart it manually. It's only used with `npm run dev`. |

Backend was initialized with `npm init -y` to generate `package.json` quickly with sensible defaults, then customized (`dev`/`start` scripts added manually).

### Frontend (`/client`)

| Package | Why I used it |
|---|---|
| `react` + `react-dom` | Used to build the frontend with reusable components and manage the UI without directly manipulating the DOM. |
| `vite` | Used as the development server and build tool. I chose it because it starts quickly and has fast hot reloading during development. |
| `axios` | Used for making requests from the frontend to the backend. I found it simpler to work with than `fetch`, especially when handling JSON responses and errors. |

Frontend was scaffolded with `npm create vite@latest client -- --template react`, which set up the React + Vite boilerplate automatically.

## Server Code Logic (`server/index.js`)

- **Storage:** a plain JavaScript array (`tasks`) plus an incrementing `nextId` counter, both held in server memory. Resets on every server restart — see Assumptions below.
- **Middleware:** `app.use(cors())` allows the frontend origin through; `app.use(express.json())` parses incoming JSON request bodies so `req.body` works.
- **Routes:**
  - `GET /tasks` — returns the full tasks array.
  - `POST /tasks` — validates that `title` exists and isn't just whitespace (`title.trim()`), then creates a new task object with an auto-incremented `id`. Returns `400` if validation fails, `201` on success.
  - `PUT /tasks/:id` — finds the task by `id`; if it doesn't exist, returns `404`. If `title` is being updated, it re-validates it can't be set to empty. Only updates the fields actually sent in the request body (so a status-only update doesn't wipe out the title/description).
  - `DELETE /tasks/:id` — finds and removes the task by `id`, or returns `404` if it doesn't exist.
- **Status codes used deliberately:** `200` (success), `201` (created), `400` (validation error), `404` (not found) — so the frontend (and anyone testing the API) gets meaningful signals rather than everything just returning `200`.

## Testing the API

Before building the frontend, I tested every endpoint directly using `curl` from the terminal, to confirm the backend logic worked in isolation before adding a UI on top of it. This let me separate backend bugs from frontend bugs later. I verified:
- Creating a task successfully (`201` + correct task data returned)
- Rejecting a task with no title (`400` + correct error message)
- Fetching all tasks (`200` + array containing created tasks)
- Updating a task's status (`200` + updated task returned)
- Rejecting an update that sets the title to empty (`400`)
- Deleting a task (`200` + confirmation message)
- Confirming a deleted task no longer appears in `GET /tasks`

All passed before I connected the frontend.

## Frontend Code Logic (`client/src/App.jsx`)

- **State:** `tasks` stores the tasks loaded from the API. `title`, `description`, and `status` store the form values. `editingId` keeps track of whether the form is creating or editing a task, while `error` stores any validation or API errors shown to the user.
- **Loading tasks:** `useEffect` runs when the page loads and calls `loadTasks()`, which fetches all tasks from the backend using `GET`.
- **One form for creating and editing:** `handleSubmit` checks `editingId`. If a task is being edited, it sends a `PUT` request; otherwise, it sends a `POST` request. This keeps the form logic in one place instead of having separate forms.
- **Changing status:** A task's status can be updated from the edit form or directly from the dropdown on the task card. The dropdown sends a `PUT` request immediately, making it quicker to move tasks between statuses.
- **Frontend and backend validation:** The frontend checks that the title isn't empty before sending a request, giving the user immediate feedback. The backend also validates the data independently, since frontend validation can be bypassed when making requests directly to the API.

## Design & Styling

I went with a purple, pink, and white color palette in `client/src/App.css` instead of keeping the default Vite styling. I wanted the app to feel clean and polished while still having a bit of my own style.

A few of the design choices:

- **Poppins font:** Loaded from Google Fonts in `index.html` for a clean and modern feel.
- **Status colors:** I added a small `getStatusColor()` helper in `App.jsx` to give each task status its own color — pink for **To Do**, purple for **In Progress**, and deep plum for **Done**. This makes the status easy to spot without having to read through the dropdown.
- **Task cards:** Tasks are displayed in cards with rounded corners, soft shadows, and enough padding to keep the content, especially longer descriptions, easy to read.

These design choices weren't required by the brief, but I wanted the finished app to feel more complete and show some personal effort beyond just getting the CRUD functionality working.

## Assumptions & Shortcuts

- **In-memory storage:** Tasks are reset whenever the backend restarts. The brief says a database is optional, so I kept things simple and focused on the API and overall functionality.
- **No authentication:** This is a single-user assignment, so I didn't add login or user accounts.
- **No automated tests:** I tested the API endpoints manually with `curl` and checked the main UI flows in the browser. Given the 3–5 hour time limit, I didn't add a testing framework. With more time, I'd add API tests using something like Jest and Supertest.
- **Simple styling:** I added custom colors, fonts, and task cards to give the app some personality, but kept the design fairly simple so I could focus on the core functionality.
- **Simple task IDs:** Tasks use incrementing numbers instead of UUIDs. This works fine for the current in-memory setup, but I'd use a more robust ID system for a production app.

## API Endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|---------------------------------|
| GET    | /tasks        | Get all tasks                   |
| POST   | /tasks        | Create a task (title required)  |
| PUT    | /tasks/:id    | Update a task's title/description/status |
| DELETE | /tasks/:id    | Delete a task                   |

## How to Run It

You'll need **Node.js v18+** installed.

### 1. Clone the repo
```bash
git clone https://github.com/Wairimu-huho/amref-task-tracker.git
cd amref-task-tracker
```

### 2. Start the backend
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Start the frontend (in a new terminal)
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`. Open that URL in your browser.

Both servers must be running at the same time for the app to work.

## What I'd Improve With More Time

The app covers the main requirements, but there are a few things I'd add if I had more time:

- **Add MongoDB:** This would make tasks persistent instead of resetting whenever the server restarts.
- **Add automated tests:** I'd add backend tests with Jest and Supertest, along with a few basic frontend tests.
- **Improve loading and error handling:** I'd make these states more consistent across all actions, not just when the app first loads.
- **Add filtering and sorting:** This would make it easier to find and manage tasks, especially as the list grows.