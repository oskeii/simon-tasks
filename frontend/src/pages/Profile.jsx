import React, { useState, useEffect } from 'react'
import api from '../axios'

const ProfileForm = ({profile, setProfile, user, setUser}) => {

    const submitUpdate = async (e) => {
        e.preventDefault();

        // try {
        //     const {data} = await api.post('/profile/', 
        //         document.querySelector('#profile-form'),
        //         {headers: {
        //             'Content-Type': 'application/json'
        //         }}
        //     );
            
        //     alert('Profile update successful');
        // } catch (err) {
        //     setField_err(err.response.data)
        //     console.error(err);
        //     setStatusCode(err.response.status)
        //     console.log(statusCode)
        //     if (statusCode != 400) {
        //         setError(`Failed to update profile. Possible server error... \nStatus Code: ${statusCode}`)
        //     } else {
        //         setError('Failed to update profile. Please check field requirements.')
        //     }
            
        // }
    }

    const handleChange = (e) => {
        switch (e.target.id) {
            case 'username':
                setUser({...user, 'username': e.target.value})
                break;
            case 'email':
                setUser({...user, 'email': e.target.value})
                break;
            default:
                console.log(e.target.value)
        }
        
    }

    return (
        <div className='user-info-edit'>
            <form id="profile-form" method="POST" encType="multipart/form-data" onSubmit={submitUpdate}>
                <fieldset>
                    <legend>Profile Info</legend>
                    <p>
                    <label htmlFor='username'>
                        Username:
                        <input type='text' id='username' name='username' 
                            value={user.username} onChange={handleChange}/>  
                    </label>
                    </p>
                    <p>
                    <label htmlFor='email'>
                        Email:
                        <input type='email' id='email' name='email' 
                            value={user.email} onChange={handleChange}/>  
                    </label>
                    </p>
                    <p>
                    <label htmlFor='image'>
                        Image:
                        <input type='file' id='image' name='image' />  
                    </label>
                    </p>
                </fieldset>
                <button type='submit'>Update</button>
            </form>
            <p><a href='#'>Need to reset your password?</a></p>
        </div>
    )
}


const Profile = () => {
    const [profile, setProfile] = useState("[nothing here]");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getProfile = async () => {

        try {
            const response = await api.get('profile/');
            setProfile(response.data['profile']);
            setUser(response.data.user);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user profile', err);
            setLoading(false);
        }
        
    };


    useEffect(() => {
        getProfile();
    }, []);


    if (loading) {
        return <div>Loading profile...</div>;
    }


    return (
        <div>
            <h1>Profile here...</h1>
            <div className='user-info-card'>
                <img className='profile-pic' src={profile.image} alt='profile picture' />
                <h3>@{user.username}</h3>
                <p>{user.email}</p>
            </div>
            <ProfileForm profile={profile} setProfile={setProfile} user={user} setUser={setUser} />
            
            
        </div>
    )
}

export default Profile