import Home from "./pages/Home/";
import Dashboard from "./pages/Dashboard/";
import { BrowserRouter as Router, Routes, Route } from "react-router";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
