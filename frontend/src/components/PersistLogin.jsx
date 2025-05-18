import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { auth, refreshToken } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refreshToken();
            } catch (err) {
                // Token refresh failed - user must log in
                console.error("Authentication verification failed:", err);
            }
            finally {
                // Only update state if component is still mounted
                if (isMounted) setIsLoading(false);
            }
        };

        // Only attempt refresh if not already authenticated
        !auth?.isAuthenticated ? verifyRefreshToken() : setIsLoading(false);
        
        // Cleanup to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []);


    useEffect(() => {
        console.log(`isLoading: ${isLoading}`);
        console.log("Auth state in PersistLogin:", auth);
    },[isLoading])

    return (
        <>
            {isLoading
            ? <p> Loading...</p>
            : <Outlet/>
            }
            
        </>
    );
};

export default PersistLogin;