import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
// import axios from "../config/axios";
import axios from "axios";


const UserAuth = ({ children }) => {

    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const { user, setUser } = useUser();

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
        else {
            axios.get(`${import.meta.env.VITE_BASE_URL}/user/profile`, {
                headers: {
                    Authorization: `bearer ${token}`
                }
            })
                .then((response) => {
                    setUser(response.data.user);
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    localStorage.removeItem('token')
                    navigate('/login');
                })
        }
    }, [])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black/20 fixed top-0 left-0">
                Loading...
            </div>
        )
    }
    return (
        <div>
            {children}
        </div>
    )
}

export default UserAuth
