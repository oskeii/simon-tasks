import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken(); // refresh function
    const { auth } = useAuth();

    useEffect(() => {
        let isMounted = true;
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.aT ? verifyRefreshToken() : setIsLoading(false); // !! doesnt automatically updatewhen cookie expires
        
        return () => {isMounted = false;}
    }, [])


    useEffect(() => {
        console.log(`isLoading: ${isLoading}`);
        console.log("Auth state in PersistLogin:", auth);
    },[isLoading])
    useEffect(() => {
        console.log("Auth state in PersistLogin:", auth);
    },[auth])

    return (
        <>
            {isLoading
            ? <p> Loading...</p>
            : <Outlet/>
            }
            
        </>
    )
}

export default PersistLogin;