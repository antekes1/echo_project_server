import Navbar from "./layouts/Navbar";
import api from "./api";
import Home from "./pages/Home";
import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import StoragePage from "./pages/storage/StoragePage";
import StorageSettingsPage from "./pages/storage/StorageSettingsPage";

const App = () => {
  return (
    <SidebarProvider>
    <div className="max-h-screen flex flex-col">
    <Router>
        <Navbar/>
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/profile" element={<ProfilePage />} />
            <Route exact path="/settings" element={<SettingsPage />} />
            <Route path="/storage/:id" element={<StoragePage />} />
            <Route path="/storage_settings/:id" element={<StorageSettingsPage />} />
        </Routes>
    </Router>
    </div>
    </SidebarProvider>
);
};
export default App;