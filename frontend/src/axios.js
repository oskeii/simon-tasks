import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 10000, // 10 secs
});

// add Authorization header to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// handle token expiration and refreshing
api.interceptors.response.use(
    (response) => response, // return as is if success
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // prevent infinite retry

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post('/api/token/refresh/',
                    {refresh: refreshToken,}
                );

                const { access, refresh } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);

                originalRequest.headers['Authorization'] = `Bearer ${access}`;

                return axios(originalRequest);
            } catch (err) {
                console.error('Error refreshing token', err);

            }
        }

        return Promise.reject(error);  // error is not a 401 or refresh failure
    }
);

export default api;