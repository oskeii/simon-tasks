import axios from "../services/axios";
import useAuth from "./useAuth";
import useLogout from "./useLogout";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const { handleLogout } = useLogout();

    const refresh = async () => {
        try {
            const response = await axios.post('/auth/refresh/', {}, {withCredentials:true})
            
            // If we get here, token refresh was successful
            setAuth(prev => ({...prev, isAuthenticated: true}));
            return true;
        } catch (err) {
            console.error("Token refresh failed:", err);
            
            // Logout on refresh failure
            handleLogout();
            throw err;
        }
    };
    return refresh;
};

export default useRefreshToken;