import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from '../services/axios';
import { LogIn } from 'lucide-react';

const LOGIN_URL = '/auth/';

const Login = () => {
    const { login } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
    }, [username, password]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                LOGIN_URL,
                { username, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(response);
            const user_data = response.data.user;
            console.log('This is USER_DATA:\n', user_data);
            login(user_data); // set auth state
            alert('Login successful');

            //redirect here...
            navigate(from, { replace: true, state: null });

            setUsername('');
            setPassword('');
        } catch (err) {
            console.error(err);
            if (!err?.response) {
                setError('No Server Response');
            } else if (err.response?.status === 400) {
                setError('Login failed! Check your credentials.');
            } else if (err.response?.status === 401) {
                setError('Unauthorized. Please check your credentials.');
            } else {
                setError('Server Error.');
            }
        }
    };
    return (
        <div className='mx-auto max-w-lg text-center bg-blue-50 border-1 border-blue-900/50 rounded-xl shadow-xl/30'>
            <h2>Login</h2> 
            <hr className=' text-black/50'/>
            {error && <p className='error'>{error}</p>}
            <form className='my-4 mx-10 p-1' onSubmit={handleLogin}>
                <p className='m-1'>
                    <label htmlFor='username' className='block'>Username:</label>
                    <input className='input w-5/6'
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        autoComplete="off"
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </p>

                <p className='m-1'>
                    <label htmlFor='password' className='block'>Password:</label>
                    <input className='input w-5/6'
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </p>
                <button className='btn m-6 w-5/6' type="submit">
                    Login
                    <LogIn className='inline ml-2'/>
                </button>
            </form>
            <hr className=' text-black/50'/>
            <p className='p-1 text-sm'>
                Dont Have an Account Yet?{' '}
                <Link to={'/register'} className='font-semibold text-indigo-600 hover:text-indigo-500'>
                    Register Here!
                </Link>
            </p>
        </div>
    );
};

export default Login;
