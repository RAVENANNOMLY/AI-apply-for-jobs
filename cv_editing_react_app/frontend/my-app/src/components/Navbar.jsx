import { Link, useLocation } from "react-router-dom";

export default function Navbar({ theme, setTheme }) {
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary fixed-top">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          Home
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="ms-auto">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                Job List
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/job-analysis")}`}
                to="/job-analysis"
              >
                Job Analysis
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/resume")}`} to="/resume">
                Resume
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/cover-letter")}`}
                to="/cover-letter"
              >
                Cover Letter
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/connection")}`}
                to="/connection"
              >
                Connection
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
