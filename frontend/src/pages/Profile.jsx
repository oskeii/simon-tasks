import React, { useState, useEffect } from 'react';
import useProfile from '../context/ProfileContext';
import ProfileForm from '../components/ProfileForm';
import useApiService from '../services/apiService';

const Profile = () => {
    const apiService = useApiService();
    const [loading, setLoading] = useState(true);
    const { profile, user, refresh, updateProfile } = useProfile();

    const getProfile = async () => {
        setLoading(true);

        try {
            const response = await apiService.profile.get();
            await updateProfile(response.data.data);
        } catch (err) {
            console.error('Error fetching user profile', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        getProfile();
    }, [refresh]);

    if (loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className='flex flex-col-reverse lg:flex-row items-center justify-around my-2 lg:my-8'>
            <ProfileForm />
            
            <div className="flex flex-col md:flex-row items-center text-center bg-gray-50 m-8 p-4 pb-16 max-w-lg rounded-2xl border-2 border-blue-900/10 shadow-lg">
                <img
                    className="h-36 w-36 object-cover rounded-full ring-1 ring-blue-900/25 shadow-md"
                    src={`${profile.image}?${new Date().getTime()}`}
                    alt="profile picture"
                />

                <div className='text-left pr-8 pl-4'>
                        {user.first_name && <h2 className='m-0'>{user.first_name}</h2>}
                    <div className='text-gray-600 mt-2'>
                        <h3>@{user.username}</h3>
                        <p>{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
