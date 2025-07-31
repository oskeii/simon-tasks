import axios from '../services/axios';

const useAuthService = () => {
    const getCurrentUser = async () => {
        try {
            const response = await axios.get('/users/me/', {
                withCredentials: true,
            });
            if (response.data?.success) {
                return response.data.data; // user data
            }
            return null;
        } catch (err) {
            console.error('Failed to get current user: ', err);
            return null;
        }
    };

    // Call the auth API
    const refreshToken = async () => {
        try {
            await axios.post('/auth/refresh/', {}, { withCredentials: true });
            return true;
        } catch (err) {
            console.error('Token refresh failed:', err);
            return false;
        }
    };

    // API call to log out
    const logoutFromServer = async () => {
        try {
            await axios.post('/logout/', {}, { withCredentials: true });
            return true;
        } catch (err) {
            console.error('Logout API call failed:', err);
            return false;
        }
    };

    return {
        getCurrentUser,
        refreshToken,
        logoutFromServer,
    };
};

export default useAuthService;
