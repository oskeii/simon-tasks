import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardPen } from 'lucide-react';

const Register = () => {
    const [error, setError] = useState('');
    const [statusCode, setStatusCode] = useState(null);
    const [field_err, setField_err] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                '/api/register/',
                document.querySelector('#registration-form'),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            alert('Account created! Proceed to login.');
            window.location.href = '/login/';
        } catch (err) {
            setField_err(err.response.data);
            console.error(err);
            setStatusCode(err.response.status);
            console.log(statusCode);
            if (statusCode !== 400) {
                setError(
                    `User registration failed! Possible server error... \nStatus Code: ${statusCode}`
                );
            } else {
                setError(
                    'User registration failed! Please check field requirements.'
                );
            }
        }
    };

    return (
        <div>
            <p className='m-3 p-1 font-semibold text-indigo-600 hover:text-indigo-500'>
                <Link to={'/login'}>&larr; Back to Login</Link>
            </p>
            <div className='mx-auto max-w-3xl text-center bg-blue-50 border-1 border-blue-900/50 rounded-xl shadow-xl/30'>
                <h2>Create an Account!</h2>
                <hr className=' text-black/50'/>
                {error && <p className='error'>{error}</p>}
                <form className='my-4 mx-10 p-1'
                    id="registration-form"
                    method="POST"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >
                    <p>
                        <label htmlFor="username" className='block'>Username:</label>
                        <input className='input w-5/6'
                            type="text"
                            id="username"
                            name="username"
                            autoFocus
                            required
                        />
                        
                        {field_err.username && (
                            <span className='error'>
                                {field_err.username}
                            </span>
                        )}
                    </p>
                    <p>
                        <label htmlFor="password" className='block'>Password:</label>
                        <input className='input w-5/6'
                            type="password"
                            id="password"
                            name="password"
                            minLength={8}
                            required
                        />
                        
                        {field_err.password && (
                            <span className='error'>
                                {field_err.password}
                            </span>
                        )}
                    </p>

                    <p>
                        <label htmlFor="confirm-password" className='block'>Confirm Password:</label>
                        <input className='input w-5/6'
                            type="password"
                            id="confirm-password"
                            name="confirm_password"
                            required
                        />
                    
                        {field_err.confirm_password && (
                            <span className='error'>
                                {field_err.confirm_password}
                            </span>
                        )}
                    </p>
                    
                    <p>
                        <label htmlFor="email" className='block'>Email:</label>
                        <input className='input w-5/6'
                            type="email"
                            id="email"
                            name="email"
                            required
                        />

                    {field_err.email && (
                        <span className='error'>{field_err.email}</span>
                    )}
                    </p>

                    <p>
                        <label htmlFor="first-name" className='block'>First Name:</label>
                        <input className='input w-5/6'
                            type="text"
                            id="first-name"
                            name="first_name"
                        />
                        {field_err.first_name && (
                            <span className='error'>
                                {field_err.first_name}
                            </span>
                        )}
                    </p>

                    <p>
                        <label htmlFor="last-name" className='block'>Last Name:</label>
                        <input className='input w-5/6'
                            type="text"
                            id="last-name"
                            name="last_name"
                        />

                        {field_err.first_name && (
                            <span className='error'>
                                {field_err.first_name}
                            </span>
                        )}
                    </p>

                    <button className='btn m-4 py-2 w-5/6' type="submit">
                        Register
                        <ClipboardPen className='inline ml-2' />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
