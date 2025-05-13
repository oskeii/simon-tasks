import axios from "../services/axios";

const useAuthService = () => {
    // Call the auth API
    const refreshToken = async () => {
        try {
            await axios.post('/auth/refresh/', {}, { withCredentials: true });
            return true;
        } catch (err) {
            console.error("Token refresh failed:", err);
            return false;
        }
    };

    // API call to log out
    const logoutFromServer = async () => {
        try {
            await axios.post('/logout/', {}, { withCredentials: true });
            return true;
        } catch (err) {
            console.error("Logout API call failed:", err);
            return false;
        }
    };

    return {
        refreshToken,
        logoutFromServer
    };
};

export default useAuthService;
