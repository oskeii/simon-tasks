import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { refreshToken } = useAuth();
    return refreshToken;
};

export default useRefreshToken;