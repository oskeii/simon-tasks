import { axiosPrivate } from "../services/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import useLogout from "./useLogout";
import { useNavigate, useLocation } from "react-router-dom";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();
    const location = useLocation();


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

                // If we get a 401 or 403, attempt to refresh (unless we already tried)
                if ((error.response.status === 401 || error.response.status === 403) 
                    && !originalRequest?.sent) {
                    originalRequest.sent = true;
                    try { // new access token and retry
                        const validAT = await refresh();
                        console.log(`auth state:\n ${auth.aT}`)
                        // setAuth()
                        originalRequest.withCredentials = true; 
                        console.log(originalRequest)
                        
                        return axiosPrivate(originalRequest);  
                    } catch (refreshErr) {
                        // If refresh throws an error (token expired, server error, etc.)
                        console.error("Refresh failed:", refreshErr);
                        const username = auth.username;
                        await logout();
                        navigate('/login', { replace: true, state: { from: { location, user: username } } });

                        //return Promise.reject(refreshErr); // other logout logic??
                    } 
                }
                // If error is not 401/403 or the request was already retried, reject
                return Promise.reject(error);
            }
        );
        
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh, navigate]);

    return axiosPrivate;
};

export default useAxiosPrivate;