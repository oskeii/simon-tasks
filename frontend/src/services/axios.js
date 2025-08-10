import axios from 'axios';
const BASEURL = 'http://localhost:8000/api';

export default axios.create({
    baseURL: BASEURL,
    timeout: 10000, // 10 secs
});

export const axiosPrivate = axios.create({
    baseURL: BASEURL,
    timeout: 10000, // 10 secs
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
