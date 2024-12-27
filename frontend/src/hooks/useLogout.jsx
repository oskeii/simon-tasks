import axios, { axiosPrivate } from "../axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({}); //setAuth({username: null, aT: false, rT:false})
        try {
            const response = await axios.post('/logout/', 
                {}, {withCredentials: true}
            );
            console.log(response)
            return response;
        } catch (err) {
            console.error(err);
        }
    }
    return logout;
}

export default useLogout;