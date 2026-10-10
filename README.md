# Online Exam Frontend

React + Vite + Bootstrap frontend starter for the Online Exam Platform.

## Stack

- React
- Vite
- React Router
- Bootstrap 5
- Bootstrap Icons

## Run

```bash
npm install
npm run dev
```

Then open the URL shown by Vite.

## Current pages

- `/` - Home
- `/login` - Placeholder
- `/register` - Placeholder
- `/exams` - Placeholder

## Structure

```text
src/
├── components/
│   ├── Header.jsx
│   ├── Navbar.jsx
│   └── Footer.jsx
├── pages/
│   └── Home.jsx
├── styles/
│   └── home.css
├── App.jsx
└── main.jsx
```

The Navbar, Header and Footer are reusable components and can be retained across the public-facing pages.

The exam, authentication, dashboard and admin logic can be integrated later without changing the visual component architecture.
