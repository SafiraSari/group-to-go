import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import Events from "./pages/Events";
import Schedule from "./pages/Schedule";
import Maps from "./pages/Map";
import SignupPage from "./pages/Signup";
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
          <Route path="/map" element={<Maps/>} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
