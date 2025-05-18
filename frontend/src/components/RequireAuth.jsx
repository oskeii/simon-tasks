import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.isAuthenticated
            ? <Outlet />
            : <Navigate to='/login' state={{ from: { pathname: location.pathname }}} replace />
    )
}

export default RequireAuth;