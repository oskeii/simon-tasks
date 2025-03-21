import axios from "../services/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post('/logout/', {}, {withCredentials: true});
        } catch (err) {
            console.error(err);
        } finally {
            // Always update auth state even if API fails
            logout();
        }
    }
    return handleLogout;
}

export default useLogout;