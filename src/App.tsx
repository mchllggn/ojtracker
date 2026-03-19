import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<Home />} />
      <Route path="/calendar" element={<Calendar />} />
    </Routes>
  );
};

export default App;
