import logo from "../assets/logo.png"
import './Home.css';

function Home() {
  return (
    <div className="Home">
      <header className="Home-header">
        <img src={logo} className="Home-logo" alt="logo" />
        <p>
          Group to Go
        </p>
      </header>
    </div>
  );
}
  
export default Home;
