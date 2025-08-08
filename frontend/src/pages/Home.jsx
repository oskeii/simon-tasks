import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { LogIn, LogOut } from 'lucide-react';

const Home = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/'); // Redirect to login page?
    };

    const AuthButton = () => {
        if (!auth?.isAuthenticated) {
            return (
                <Link to="/login">
                    <button className='btn'>
                        Log In
                        <LogIn className='inline ml-2'/>
                    </button>
                </Link>
            );
        } else {
            return (
                <button
                    className="btn btn-danger py-2 px-4"
                    onClick={handleLogout}
                >
                    <LogOut className='inline mr-2'/>
                    Logout
                </button>
            );
        }
    };

    return (
        <div className='text-center'>
            {auth?.isAuthenticated ? (
                <h2>Hello, {auth?.user.first_name || auth?.user.username}!</h2>
            ) : (
                <h1>Welcome</h1>
            )}

            <div className='mt-6'>
                <AuthButton />
            </div>
        </div>
    );
};

export default Home;
