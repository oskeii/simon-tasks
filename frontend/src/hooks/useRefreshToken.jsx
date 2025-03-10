import axios from "../services/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await axios.post('/auth/refresh/', {}, {withCredentials:true})
            if (response?.data?.access) {
                console.log(prev);
                console.log(response.data.access);
                setAuth(prev => ({...prev, aT:true, rT:true}));
            } else {
                setAuth(prev => ({...prev, aT:false, rT:false}));
                
                throw new Error("No access token in response");
            }
            console.log("Updated auth state:", auth);
        } catch (err) {
            console.error("Refresh token failed:", err);
            setAuth(prev => ({...prev, aT:false, rT:false}));
            console.log("Updated auth state:", auth);
            throw err
        }
        return auth.aT; 
    };

    return refresh;
};

export default useRefreshToken;