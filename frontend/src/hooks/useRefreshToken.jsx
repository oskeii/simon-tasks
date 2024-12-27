import axios from "../axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.post('/auth/refresh/', {}, {withCredentials:true})
        // const response = await axiosPrivate.post('/auth/refresh/');
        setAuth(prev => {
            console.log(prev);
            console.log(response.data.access);
            if (response?.data?.access) {
                return {...prev, aT:true, rT:true}
            } else {
                return {...prev, aT:false, rT:false};
            }
            
            
        })
        console.log(`auth state:\n ${auth.aT}`)

        return auth.aT; //response.data.access;
    }
    return refresh;
};

export default useRefreshToken;