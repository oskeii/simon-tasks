import axios from "../services/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({});
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