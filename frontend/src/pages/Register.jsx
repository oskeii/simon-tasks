import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
            <p>
                <Link to={'/login'}>&larr; Back to Login</Link>
            </p>
            <h1>Create an Account!</h1> <hr />
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form
                    id="registration-form"
                    method="POST"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >
                    {' '}
                    {/* ADD FORM VALIDATION*/}
                    <p>
                        <label htmlFor="username">
                            Username:
                            <input
                                type="text"
                                id="username"
                                name="username"
                                autoFocus
                                required
                            />
                        </label>
                        {field_err.username && (
                            <span style={{ color: 'red' }}>
                                {field_err.username}
                            </span>
                        )}
                    </p>
                    <p>
                        <label htmlFor="password">
                            Password:
                            <input
                                type="password"
                                id="password"
                                name="password"
                                minLength={8}
                                required
                            />
                        </label>
                        {field_err.password && (
                            <span style={{ color: 'red' }}>
                                {field_err.password}
                            </span>
                        )}
                    </p>
                    <p>
                        <label htmlFor="confirm-password">
                            Confirm Password:
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm_password"
                                required
                            />
                        </label>
                        {field_err.confirm_password && (
                            <span style={{ color: 'red' }}>
                                {field_err.confirm_password}
                            </span>
                        )}
                    </p>
                    <p>
                        <label htmlFor="email">
                            Email:
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                            />
                        </label>
                    </p>
                    {field_err.email && (
                        <span style={{ color: 'red' }}>{field_err.email}</span>
                    )}
                    <p>
                        <label htmlFor="first-name">
                            First Name:
                            <input
                                type="text"
                                id="first-name"
                                name="first_name"
                            />
                        </label>
                        {field_err.first_name && (
                            <span style={{ color: 'red' }}>
                                {field_err.first_name}
                            </span>
                        )}
                    </p>
                    <p>
                        <label htmlFor="last-name">
                            Last Name:
                            <input
                                type="text"
                                id="last-name"
                                name="last_name"
                            />
                        </label>
                        {field_err.first_name && (
                            <span style={{ color: 'red' }}>
                                {field_err.first_name}
                            </span>
                        )}
                    </p>
                    <hr />
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
