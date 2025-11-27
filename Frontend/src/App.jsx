import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import GoogleTranslate from "./components/GoogleTranslate";

function App() {
  return (
    <Router>
      <div className="relative w-full h-screen font-sans">
        <div className="fixed top-4 right-4 z-50">
          <GoogleTranslate />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
