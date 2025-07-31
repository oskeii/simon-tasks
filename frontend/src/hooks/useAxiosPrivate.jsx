import { axiosPrivate } from '../services/axios';
import { useEffect } from 'react';
import useAuth from './useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const useAxiosPrivate = () => {
    const { refreshToken } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            // Success handler - simply return the response
            (response) => response,
            // Error handler - try to refresh token if status 401/403
            async (error) => {
                const originalRequest = error?.config;

                if (!originalRequest) {
                    return Promise.reject(error);
                }

                // If we get a 401 or 403,and haven't attempted refresh
                if (
                    (error.response?.status === 401 ||
                        error.response.status === 403) &&
                    !originalRequest?._retry
                ) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh token
                        await refreshToken();
                        // If successful, retry the original request
                        return axiosPrivate(originalRequest);
                    } catch (refreshErr) {
                        // refresh() already calls logout if it fails. just redirect to login
                        navigate('/login', {
                            replace: true,
                            state: { from: { pathname: location.pathname } },
                        });
                        return Promise.reject(refreshErr);
                    }
                }
                // For errors other than 401/403, just reject
                return Promise.reject(error);
            }
        );

        // Clean up interceptors when component unmounts
        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, []);

    return axiosPrivate;
};

export default useAxiosPrivate;
