import { Link } from "react-router-dom";
import './NavBar.css';
import logout from "../assets/logout.png";
import logo from "../assets/logo_horizontal.png"
import home from "../assets/home.png"
import groups from "../assets/groups.png"
import events from "../assets/events.png"
import schedule from "../assets/schedule.png"
import expenses from "../assets/expenses.png"
import search from "../assets/search.png"
import polls from "../assets/polls.png"

const NavBar = () => {
  return (
		<div className="nav-bar">
      <Link to="/">
        <img src={logo} alt="Logo" className="logo" />
      </Link>
			<div className="nav-container">
        <ul className="nav-list">
          <li>
            <Link to="/">
              <div className="tab-container">
                <img src={home} alt="Home" className="tab-icon" />
                <span className="tab-label">Home</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/groups">
              <div className="tab-container">
                <img src={groups} alt="Groups" className="tab-icon" />
                <span className="tab-label">Groups</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/events">
              <div className="tab-container">
                <img src={events} alt="Events" className="tab-icon" />
                <span className="tab-label">Events</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/schedule">
              <div className="tab-container">
                <img src={schedule} alt="Schedule" className="tab-icon" />
                <span className="tab-label">Schedule</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/expenses">
              <div className="tab-container">
                <img src={expenses} alt="Expenses" className="tab-icon" />
                <span className="tab-label">Expenses</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/polls">
              <div className="tab-container">
                <img src={polls} alt="Polls" className="tab-icon" />
                <span className="tab-label">Polls</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/search">
              <div className="tab-container">
                <img src={search} alt="search" className="tab-icon" />
                <span className="tab-label">Search</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/login">
              <div className="tab-container">
                <img src={logout} alt="Logout" className="tab-icon" />
                <span className="tab-label">Logout</span>
              </div>
            </Link>
          </li>

        </ul>
      </div>
		</div>
  )
}

export default NavBar;
