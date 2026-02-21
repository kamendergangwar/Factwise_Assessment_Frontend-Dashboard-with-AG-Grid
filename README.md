# Factwise Employee Dashboard

A React + Vite dashboard using **AG Grid (client-side row model)** to display and analyze employee records.

## Features

- AG Grid table with:
  - Sorting
  - Column filtering
  - Quick search
  - Row selection
  - Pagination
  - CSV export
- Department and location filters
- KPI strip (visible employees, active workforce, avg salary, avg rating)
- Analytics tabs:
  - `Overview`
  - `Insights` (Department Mix, Location Distribution, Salary Bands)
- Responsive layout for desktop and mobile

## Tech Stack

- React 19
- Vite 7
- AG Grid Community 35
- ESLint 9

## Project Structure

- `src/App.jsx` - dashboard layout, dataset, grid config, filters, analytics logic
- `src/App.css` - dashboard and AG Grid styling
- `src/main.jsx` - app bootstrap and AG Grid module registration
- `src/index.css` - global styles and font import

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

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

## AG Grid Notes

- Community modules are registered in `src/main.jsx`:

```js
ModuleRegistry.registerModules([AllCommunityModule])
```

- Grid is configured for client-side rendering with local data.

## Current Dataset

The dashboard uses a local employee dataset (20 rows) embedded in `src/App.jsx`.

## Customization Ideas

- Move dataset to `src/data/employees.json` and fetch it dynamically
- Add saved filter presets (Engineering, Finance, etc.)
- Add charts via AG Charts or Recharts for richer visual analytics
- Add dark theme toggle

