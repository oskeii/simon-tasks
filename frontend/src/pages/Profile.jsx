import React, { useState, useEffect } from 'react'
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
            await updateProfile(response.data.data)
            
        } catch (err) {
            console.error('Error fetching user profile', err);

        }
        finally {
            setLoading(false);
        }
        
    };


    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        getProfile();
    }, [refresh])

    if (loading) {
        return <div>Loading profile...</div>;
    }


    return (
        <div>
            <h1>Profile here...</h1>
            <div className='user-info-card'>
                <img className='profile-pic' src={`${profile.image}?${new Date().getTime()}`} alt='profile picture' />
                <h3>@{user.username}</h3>
                <p>{user.email}</p>
            </div>
            <ProfileForm />
            
            
        </div>
    )
}

export default Profile