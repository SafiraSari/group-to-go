import logo from "../assets/logo.png"
import './Home.css';

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <img src={logo} className="Home-logo" alt="logo" />
        <p>
          Group to Go
        </p>
      </header>
    </div>
  );
}

export default Home;
