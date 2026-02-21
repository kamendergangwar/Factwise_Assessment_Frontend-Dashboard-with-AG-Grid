# Factwise Employee Dashboard

A React + Vite dashboard using **AG Grid (client-side row model)** to manage and analyze employee data.

## Features

- AG Grid table with:
  - Sorting
  - Filtering
  - Quick search
  - Row selection
  - Pagination
  - CSV export
- Filters for:
  - Department
  - Location
  - Level
- KPI cards (headcount, active workforce, avg salary, avg performance)
- Analytics cards (department mix, location spread, salary bands)
- Theme toggle (Light/Dark)
- Responsive layout for desktop and mobile

## Tech Stack

- React 19
- Vite 7
- AG Grid Community 35
- ESLint 9

## Project Structure

- `src/App.jsx` - dashboard UI, AG Grid config, filters, KPI/analytics logic
- `src/App.css` - complete dashboard and AG Grid styling
- `src/data/employeeData.js` - employee dataset source
- `src/main.jsx` - app bootstrap + AG Grid module registration
- `src/index.css` - global styles

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start dev server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

### 5. Run lint

```bash
npm run lint
```

## AG Grid Setup

Modules are registered in `src/main.jsx`:

```js
ModuleRegistry.registerModules([AllCommunityModule])
```

The grid runs fully client-side using local data imported from:

- `src/data/employeeData.js`

## Notes

- First column (`S.No`) is serial numbering based on visible rows (not employee ID).
- Theme mode defaults to **Light** and can be switched from the top bar.

