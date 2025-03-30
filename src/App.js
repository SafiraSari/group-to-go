import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import Events from "./pages/Events";
import Schedule from "./pages/Schedule";
import Expenses from "./pages/Expenses";
import Polls from "./pages/Polls";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
