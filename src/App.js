import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import Events from "./pages/Events";
import Schedule from "./pages/Schedule";
import Polls from "./pages/Polls";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/polls" element={<Polls />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
