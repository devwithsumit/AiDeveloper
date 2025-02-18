import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '../screens/Login.jsx'
import Register from '../screens/Register.jsx'
import Home from '../screens/Home.jsx'
import Project from '../screens/Project.jsx'

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path='/project' element={<Project />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
