import { axiosPrivate } from "../axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();


    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => { // add authorization header to initial request, if missing
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer xyzzz`;
                }
                config.withCredentials = true;
                console.log(config)
                return config;
            }, (error) => Promise.reject(error)
        );
        
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response, // return as is if success
            async (error) => {  // if error, get new access token and retry
                const originalRequest = error?.config;
                console.log(originalRequest)
                console.log(`status: ${error.response.status}`)
                console.log(`auth state:\n ${auth.aT}`)
                if ((error.response.status === 401 || error.response.status === 403) 
                    && !originalRequest?.sent) {
                    originalRequest.sent = true;
                    // new access token and retry
                    
                    const validAT = await refresh();
                    console.log(`auth state:\n ${auth.aT}`)
                    // setAuth()
                    originalRequest.withCredentials = true; 
                    console.log(originalRequest)
                    
                    return axiosPrivate(originalRequest);
                }
                return Promise.reject(error);

            }
        );
        
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }

    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;