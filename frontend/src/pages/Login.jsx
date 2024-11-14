import React, {useState} from 'react'
import axios from 'axios'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await axios.post('/api/token/', 
                {username, password}
            );

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            alert('Login successful');
            //redirect here...
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            setError('Login failed! Check your credentials.');
    }

    }; 
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />

                <input 
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button type='submit'>Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;