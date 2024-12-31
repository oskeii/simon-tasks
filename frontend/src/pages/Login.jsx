import React, {useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import axios from '../axios';
const LOGIN_URL = '/auth/'

const Login = () => {
    const { login } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.location.pathname || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
    }, [username, password])

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL,
                {username, password}, 
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true 
                }
            );
            console.log(response)
            login(username) // 
            alert('Login successful');
            
            //redirect here...
            const redirectedUser = location.state?.from?.user;
            console.log(redirectedUser, username)
            
            if (redirectedUser === username) {
                // previous user may be redirected back to their previous page
                navigate(from, { replace: true, state: null })
            } else {
                // different user has logged in; clear `from` and redirect to homepage
                navigate('/', { replace: true, state: null })
            }

            setUsername('');
            setPassword('');

        } catch (err) {
            console.error(err);
            if (!err?.response) {setError('No Server Response');}
            else if (err.response?.status === 400) {
                setError('Login failed! Check your credentials.');
            }
            else if (err.response?.status === 401) {
                setError('Unauthorized. Please check your credentials.');
            }
            else {
              setError('Server Error.');  
            }
            
    }

    }; 
    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleLogin}>
                <p>
                <label>
                    Username: 
                    <input 
                    type='text'
                    id='username'
                    placeholder='Username'
                    value={username}
                    autoComplete='off'
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </label>   
                </p>
                
                <p>
                <label>
                    Password: 
                   <input 
                    type='password'
                    id='password'
                    placeholder='Password'
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    /> 
                </label>    
                </p>
                <button type='submit'>Login</button>
            </form> 
            <hr/>
            <p>
                Dont Have an Account Yet? <Link to={'/register'}>Register Here!</Link>
            </p>
            
        </div>
    );
};

export default Login;