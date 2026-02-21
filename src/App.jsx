import { useCallback, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './App.css'


import { employeeData } from './data/employeeData'

/* ─── Formatters ─────────────────────────────────────────────────────────── */
const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ALL_DEPTS = 'All Departments'
const ALL_LOCS = 'All Locations'
const ALL_LVLS = 'All Levels'

const DEPT_COLORS = {
  Engineering: '#3b82f6',
  Marketing: '#14b8a6',
  Sales: '#f59e0b',
  HR: '#8b5cf6',
  Finance: '#22c55e',
  Design: '#ec4899',
  Operations: '#f97316',
  Legal: '#a855f7',
}

const BAR_CLASSES = ['blue', 'teal', 'amber', 'violet', 'pink', 'blue', 'amber', 'violet']

/* ─── Cell Renderers ─────────────────────────────────────────────────────── */
function EmployeeCellRenderer({ value, data }) {
  const initials = `${data.firstName[0]}${data.lastName[0]}`
  return (
    <div className="emp-cell">
      <div
        className="emp-avatar"
        style={{ background: `linear-gradient(135deg, ${data.avatarColor}cc, ${data.avatarColor})` }}
      >
        {initials}
      </div>
      <div className="emp-info">
        <span className="emp-name">{value}</span>
        <span className="emp-position">{data.position}</span>
      </div>
    </div>
  )
}

function StatusCellRenderer({ value }) {
  return (
    <span className={`status-pill ${value ? 'active' : 'inactive'}`}>
      {value ? 'Active' : 'Inactive'}
    </span>
  )
}

function DeptCellRenderer({ value }) {
  return <span className={`dept-chip ${value}`}>{value}</span>
}

function RatingCellRenderer({ value }) {
  return (
    <span className="rating-badge">
      <svg viewBox="0 0 16 16">
        <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1 4.4 12l.7-4L2.2 5.2l4-.6z" />
      </svg>
      {value.toFixed(1)}
    </span>
  )
}

function SkillsCellRenderer({ data }) {
  const visibleSkills = data.skills.slice(0, 2)
  const remainingCount = Math.max(data.skills.length - visibleSkills.length, 0)

  return (
    <div className="skills-cell">
      {visibleSkills.map((s) => (
        <span key={s} className="skill-tag">{s}</span>
      ))}
      {remainingCount > 0 && (
        <span className="skill-tag more">+{remainingCount}</span>
      )}
    </div>
  )
}

/* ─── Sidebar Nav ────────────────────────────────────────────────────────── */
const navSections = [
  {
    label: 'People',
    items: [
      { id: 'employees', label: 'Employees', icon: 'M9 12a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H2z', badge: null },
      { id: 'analytics', label: 'Analytics', icon: 'M3 3h18v18H3V3zm4 14h2V9H7v8zm4 0h2V5h-2v12zm4 0h2v-5h-2v5z', badge: null },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'departments', label: 'Departments', icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0l9 6 9-6', badge: null },
      { id: 'payroll', label: 'Payroll', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V18h-2v-1.07A4 4 0 018.07 13H10a2 2 0 104 0h1.93A4 4 0 0113 16.93z', badge: '2' },
      { id: 'reports', label: 'Reports', icon: 'M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V9l-7-7zm-1 7V3.5L15.5 11H9a1 1 0 01-1-1z', badge: null },
    ],
  },
]

function SidebarIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

/* ─── Main App ───────────────────────────────────────────────────────────── */
function App() {
  const [theme, setTheme] = useState('light')
  const [quickFilter, setQuickFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState(ALL_DEPTS)
  const [locFilter, setLocFilter] = useState(ALL_LOCS)
  const [lvlFilter, setLvlFilter] = useState(ALL_LVLS)
  const [selectedRows, setSelectedRows] = useState(0)
  const [activeNav, setActiveNav] = useState('employees')
  const gridApiRef = useRef(null)

  const rowData = useMemo(
    () =>
      employeeData.map((e) => ({
        ...e,
        fullName: `${e.firstName} ${e.lastName}`,
      })),
    [],
  )

  const departments = useMemo(
    () => [ALL_DEPTS, ...new Set(rowData.map((r) => r.department))],
    [rowData],
  )
  const locations = useMemo(
    () => [ALL_LOCS, ...new Set(rowData.map((r) => r.location))],
    [rowData],
  )
  const levels = useMemo(
    () => [ALL_LVLS, ...new Set(rowData.map((r) => r.level))],
    [rowData],
  )

  const filteredData = useMemo(
    () =>
      rowData.filter(
        (e) =>
          (deptFilter === ALL_DEPTS || e.department === deptFilter) &&
          (locFilter === ALL_LOCS || e.location === locFilter) &&
          (lvlFilter === ALL_LVLS || e.level === lvlFilter),
      ),
    [deptFilter, locFilter, lvlFilter, rowData],
  )

  /* KPIs */
  const kpis = useMemo(() => {
    const total = filteredData.length
    const active = filteredData.filter((e) => e.isActive).length
    const avgSal = filteredData.reduce((s, e) => s + e.salary, 0) / (total || 1)
    const avgRat = filteredData.reduce((s, e) => s + e.performanceRating, 0) / (total || 1)
    return [
      { label: 'Total Employees', value: total, change: '+3 this month', dir: 'up', icon: 'M17 20H7a4 4 0 01-4-4V8a4 4 0 014-4h10a4 4 0 014 4v8a4 4 0 01-4 4zM9 12a3 3 0 100-6 3 3 0 000 6z', color: 'blue' },
      { label: 'Active Headcount', value: active, change: `${((active / total) * 100).toFixed(0)}% retention`, dir: 'up', icon: 'M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'teal' },
      { label: 'Avg. Salary', value: currencyFmt.format(avgSal), change: '+4.2% YoY', dir: 'up', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', color: 'amber' },
      { label: 'Avg. Performance', value: `${avgRat.toFixed(2)} / 5`, change: '↑ 0.1 vs last Q', dir: 'up', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'violet' },
    ]
  }, [filteredData])

  /* Analytics breakdowns */
  const deptBreakdown = useMemo(() => {
    const counts = filteredData.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredData])

  const locBreakdown = useMemo(() => {
    const counts = filteredData.reduce((acc, e) => {
      acc[e.location] = (acc[e.location] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredData])

  const salaryBands = useMemo(() => {
    const bands = [
      { label: '< $65k', count: 0, color: 'teal' },
      { label: '$65k – $90k', count: 0, color: 'blue' },
      { label: '$90k – $120k', count: 0, color: 'violet' },
      { label: '> $120k', count: 0, color: 'amber' },
    ]
    filteredData.forEach((e) => {
      if (e.salary < 65000) bands[0].count++
      else if (e.salary < 90000) bands[1].count++
      else if (e.salary <= 120000) bands[2].count++
      else bands[3].count++
    })
    return bands
  }, [filteredData])

  /* Grid config */
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  }), [])

  const columnDefs = useMemo(() => [
    {
      headerName: 'S.No',
      colId: 'serial',
      valueGetter: (params) => params.node.rowIndex + 1,
      maxWidth: 90,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
    },
    {
      headerName: 'Employee',
      field: 'fullName',
      pinned: 'left',
      minWidth: 320,
      flex: 1,
      suppressSizeToFit: true,
      tooltipField: 'fullName',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRenderer: EmployeeCellRenderer,
    },
    {
      field: 'department',
      minWidth: 140,
      cellRenderer: DeptCellRenderer,
    },
    {
      field: 'level',
      minWidth: 110,
    },
    {
      field: 'location',
      minWidth: 130,
    },
    {
      field: 'email',
      minWidth: 240,
    },
    {
      field: 'age',
      type: 'numericColumn',
      maxWidth: 90,
    },
    {
      field: 'salary',
      type: 'numericColumn',
      minWidth: 130,
      valueFormatter: (p) => currencyFmt.format(p.value),
    },
    {
      headerName: 'Hire Date',
      field: 'hireDate',
      minWidth: 130,
      valueFormatter: (p) => dateFmt.format(new Date(p.value + 'T00:00:00')),
    },
    {
      field: 'performanceRating',
      headerName: 'Rating',
      type: 'numericColumn',
      minWidth: 110,
      cellRenderer: RatingCellRenderer,
    },
    {
      field: 'projectsCompleted',
      headerName: 'Projects',
      type: 'numericColumn',
      minWidth: 110,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 110,
      filter: false,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: 'skills',
      minWidth: 280,
      filter: false,
      sortable: false,
      cellRenderer: SkillsCellRenderer,
    },
    {
      field: 'manager',
      minWidth: 160,
      valueFormatter: (p) => p.value ?? '— Executive',
    },
  ], [])

  const handleExport = useCallback(() => {
    gridApiRef.current?.exportDataAsCsv({ fileName: 'factwise-employees.csv' })
  }, [])

  const handleClearFilters = useCallback(() => {
    setDeptFilter(ALL_DEPTS)
    setLocFilter(ALL_LOCS)
    setLvlFilter(ALL_LVLS)
    setQuickFilter('')
  }, [])

  const gridThemeClass = theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'

  return (
    <div className={`app-shell ${theme}`}>
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-primary">Factwise</span>
            <span className="logo-secondary">People Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="nav-section-label">{section.label}</p>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => setActiveNav(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <SidebarIcon path={item.icon} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">KG</div>
            <div className="user-info">
              <div className="user-name">Kamender G.</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────────────────── */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Employee Dashboard</span>
            <span className="topbar-subtitle">
              {filteredData.length} of {rowData.length} employees · Last updated Feb 21, 2026
            </span>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Search employees, skills, location…"
                aria-label="Quick filter"
              />
            </div>
            <button type="button" className="topbar-btn" onClick={handleClearFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              Reset
            </button>
            <button type="button" className="topbar-btn primary" onClick={handleExport}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>
            <button
              type="button"
              className="topbar-btn"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="page-body">
          {/* KPI Strip */}
          <div className="kpi-strip">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="kpi-card">
                <div className={`kpi-icon ${kpi.color}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={kpi.icon} />
                  </svg>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className={`kpi-change ${kpi.dir}`}>{kpi.change}</div>
                </div>
              </article>
            ))}
          </div>

          {/* Filter Bar + Table */}
          <div>
            <div className="filter-bar">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                aria-label="Filter by department"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                aria-label="Filter by location"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <select
                value={lvlFilter}
                onChange={(e) => setLvlFilter(e.target.value)}
                aria-label="Filter by level"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <div className="filter-divider" />

              <div className="row-count">
                <strong>{filteredData.length}</strong> employees visible
                {selectedRows > 0 && <> · <strong>{selectedRows}</strong> selected</>}
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className={`${gridThemeClass} grid-wrap`}>
              <AgGridReact
                theme="legacy"
                rowData={filteredData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowHeight={64}
                quickFilterText={quickFilter}
                getRowId={(p) => String(p.data.id)}
                pagination
                paginationPageSize={15}
                paginationPageSizeSelector={[15, 25, 50]}
                rowSelection={{ mode: 'multiRow' }}
                animateRows
                overlayNoRowsTemplate="<span style='color:#6e7681'>No employees match the current filters.</span>"
                onGridReady={(p) => {
                  gridApiRef.current = p.api
                  p.api.sizeColumnsToFit()
                }}
                onFirstDataRendered={(e) => e.api.sizeColumnsToFit()}
                onGridSizeChanged={(e) => e.api.sizeColumnsToFit()}
                onSelectionChanged={(e) => setSelectedRows(e.api.getSelectedRows().length)}
              />
            </div>
          </div>

          {/* Analytics Bar */}
          <div className="analytics-row">
            {/* Dept Mix */}
            <div className="stat-card">
              <div className="stat-card-title">
                Department Mix
                <span>{filteredData.length} total</span>
              </div>
              <div className="bar-row">
                {deptBreakdown.map((item, i) => (
                  <div key={item.label} className="bar-item">
                    <div className="bar-header">
                      <span className="bar-label">{item.label}</span>
                      <span className="bar-count">{item.count}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${BAR_CLASSES[i % BAR_CLASSES.length]}`}
                        style={{ width: `${(item.count / (filteredData.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Spread */}
            <div className="stat-card">
              <div className="stat-card-title">
                Location Spread
                <span>{locBreakdown.length} cities</span>
              </div>
              <div className="bar-row">
                {locBreakdown.slice(0, 8).map((item, i) => (
                  <div key={item.label} className="bar-item">
                    <div className="bar-header">
                      <span className="bar-label">{item.label}</span>
                      <span className="bar-count">{item.count}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${BAR_CLASSES[(i + 2) % BAR_CLASSES.length]}`}
                        style={{ width: `${(item.count / (filteredData.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Bands */}
            <div className="stat-card">
              <div className="stat-card-title">
                Salary Bands
                <span>Full-time salary</span>
              </div>
              <div className="band-list bar-row">
                {salaryBands.map((item) => (
                  <div key={item.label} className="bar-item">
                    <div className="bar-header">
                      <span className="bar-label">{item.label}</span>
                      <span className="bar-count">{item.count} employees</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${item.color}`}
                        style={{ width: `${(item.count / (filteredData.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
