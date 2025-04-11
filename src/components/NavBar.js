import { Link, useLocation } from "react-router-dom";
import logout from "../assets/logout.png";
import logo from "../assets/logo_horizontal.png"
import home from "../assets/home.png"
import groups from "../assets/groups.png"
import events from "../assets/events.png"
import schedule from "../assets/schedule.png"
import expenses from "../assets/expenses.png"
import map from "../assets/map.png"
import polls from "../assets/polls.png"
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navTabs = [
    { path: "/", label: "Home", icon: home },
    { path: "/groups", label: "Groups", icon: groups },
    { path: "/map", label: "Map", icon: map },
    { path: "/events", label: "Events", icon: events },
    { path: "/schedule", label: "Schedule", icon: schedule },
    { path: "/expenses", label: "Expenses", icon: expenses },
    { path: "/polls", label: "Polls", icon: polls },
    { path: "/login", label: "Logout", icon: logout },
  ];

  return (
    <div className="nav-bar">
      <Link to="/">
        <img src={logo} alt="Logo" className="logo" />
      </Link>
      <div className="nav-container">
        <ul className="nav-list">
          {navTabs.map(({ path, label, icon }) => (
            <li key={path}>
              <Link to={path}>
                <div className="tab-container">
                  <img src={icon} alt={label} className="tab-icon" />
                  <span
                    className={`tab-label ${
                      currentPath === path ? "active-tab" : ""
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
