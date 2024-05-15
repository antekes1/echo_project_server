import Navbar from "./layouts/Navbar";
import api from "./api";
import Home from "./pages/Home";
import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

const App = () => {
  return (
    <div className="max-h-screen flex flex-col">
    <Router>
        <Navbar/>
        <Routes>
            <Route exact path="/" element={<Home />} />
        </Routes>
    </Router>
    </div>
);
};
export default App; 