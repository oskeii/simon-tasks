import useAuth from "./useAuth";

const useLogout = () => {
    const { logout } = useAuth();
    return logout();
};

export default useLogout;