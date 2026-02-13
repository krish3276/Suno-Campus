import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ContributorDashboard from "./pages/ContributorDashboard";
import About from "./pages/About";

function App() {
  return (

    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<Events />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contributor" element={<ContributorDashboard />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
