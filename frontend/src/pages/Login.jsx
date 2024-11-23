import React, {useState} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

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
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                <label>
                    Username: 
                    <input 
                    type='text'
                    placeholder='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </label>   
                </p>
                
                <p>
                <label>
                    Password: 
                   <input 
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    /> 
                </label>    
                </p>
                <button type='submit'>Login</button>
            </form> 
            <hr/>
            <p>Dont Have an Account Yet? <Link to={'/register'}>Register Here!</Link></p>
            
        </div>
    );
};

export default Login;