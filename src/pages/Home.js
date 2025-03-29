import logo from "../assets/logo.png"
import './Home.css';

function Home() {
  return (
    <div className="home">
      <img src={logo} className="Home-logo" alt="logo" />
      <p>
        Group to Go
      </p>
    </div>
  );
}

export default Home;
