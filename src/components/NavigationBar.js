import './NavigationBar.css';
import logo from "../assets/logo_horizontal.png"
import Home from "../pages/Home.js"
import Groups from "../pages/Groups.js"
import Events from "../pages/Events.js"
import Schedule from "../pages/Schedule.js"
import Polls from "../pages/Polls.js"

const NavigationBar = () => {
  return (
		<div className="navigation-bar">
			<a href={Home}>
				<img src={logo} className="logo" />
			</a>

			<div className="nav-container">
        <ul className="nav-links">
          <li><a href={Home}>Home</a></li>
          <li><a href={Groups}>Groups</a></li>
          <li><a href={Events}>Events</a></li>
          <li><a href={Schedule}>Schedule</a></li>
          <li><a href={Polls}>Polls</a></li>
        </ul>
      </div>
		</div>
  )
}

export default NavigationBar;
