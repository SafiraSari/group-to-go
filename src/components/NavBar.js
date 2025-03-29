import { Link } from "react-router-dom";
import './NavBar.css';
import logout from "../assets/logout.png";
import logo from "../assets/logo_horizontal.png"

const NavBar = () => {
  return (
		<div className="nav-bar">
      <Link to="/">
        <img src={logo} alt="Logo" className="logo" />
      </Link>
			<div className="nav-container">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/groups">Groups</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/schedule">Schedule</Link></li>
          <li><Link to="/polls">Polls</Link></li>
          <li><Link to="/login"><img src={logout} alt="Logo" className="logout-icon" /></Link></li>
        </ul>
      </div>
		</div>
  )
}

export default NavBar;
