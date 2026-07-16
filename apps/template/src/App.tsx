//import { useState } from 'react'
import { Routes, Route, } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import Publish from "./pages/Publish";
import ProtectedRoute from "./components/ProtectedRoute";
/* import reactLogo from './assets/react.svg' // <img src={reactLogo} className="logo react" alt="React logo" />*/
import './App.css'
import { Toaster } from "@katenda_clients/ui";
import { BrowserRouter } from "react-router-dom";
import Nav from "./components/Nav";
import { Button } from "@katenda_clients/ui";

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>

        <Nav />

        <div className="max-w-3xl mx-auto p-4">
          <Button>Click me</Button>
          <Routes>
            <Route path="/" element={<Posts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/publish"
              element={
                <ProtectedRoute>
                  <Publish />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <Toaster />

      </AuthProvider>
    </BrowserRouter>

  )
}

export default App
