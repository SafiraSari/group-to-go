import logo from "../assets/logo.png"
import NavBar from "../components/NavBar";
import './Home.css';

function Home() {
  return (
    <>
      <NavBar />
      <div className="home">
        <img src={logo} className="Home-logo" alt="logo" />
        <p>
          Group to Go
        </p>
      </div>
    </>
  );
}

export default Home;
