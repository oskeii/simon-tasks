import React, { useState, useEffect } from 'react';
import useProfile from '../context/ProfileContext';
import useApiService from '../services/apiService';
import { Save, ImageUp } from 'lucide-react';

const ProfileForm = () => {
    const apiService = useApiService();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusCode, setStatusCode] = useState(null);
    const [field_err, setField_err] = useState({});

    const {
        profile,
        setProfile,
        user,
        setUser,
        updateProfile,
        refreshProfile,
    } = useProfile();

    const submitUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(document.querySelector('#profile-form'));
        console.log(formData.get('image'));
        if (formData.get('image').name === '') {
            formData.delete('image');
        }

        try {
            const { data } = await apiService.profile.update(formData);
            console.log(data);
            await updateProfile(data);
            alert('Profile update successful');
        } catch (err) {
            setStatusCode(err.response?.status);
            console.error(err);
            if (statusCode != 400) {
                setError(
                    `Failed to update profile. Possible server error... \nStatus Code: ${statusCode}`
                );
            } else {
                setError(
                    'Failed to update profile. Please check field requirements.'
                );
            }
        } finally {
            setLoading(false);
            refreshProfile();
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [id]: value }));
    };

    return (
        <div className="bg-white p-2 max-w-lg rounded-lg border-1 border-gray-900/50 shadow-lg">
            <form className='flex flex-col items-center my-2 mx-4'
                id="profile-form"
                method="POST"
                encType="multipart/form-data"
                onSubmit={submitUpdate}
            >
                <fieldset className='text-gray-800 rounded-xs border-1 border-gray-900/50 p-4'>
                    <legend className='text-center text-lg font-semibold p-2'>Profile Info</legend>
                    <p>
                        <label htmlFor="first_name" className='block'>First Name:</label>
                        <input className='input w-full'
                            type="text"
                            id="first_name"
                            name="first_name"
                            placeholder={user.first_name}
                            onChange={handleChange}
                        />
                    </p>
                        
                    <p>
                        <label htmlFor="last_name" className='block'>Last Name:</label>
                        <input className='input w-full'
                            type="text"
                            id="last_name"
                            name="last_name"
                            placeholder={user.last_name}
                            onChange={handleChange}
                        />
                    </p>
                        
                    <p>
                        <label htmlFor="username" className='block'>Username:</label>
                        <input className='input w-full'
                            type="text"
                            id="username"
                            name="username"
                            placeholder={user.username}
                            onChange={handleChange}
                        />
                    </p>
                        
                    <p>
                        <label htmlFor="email" className='block'>Email:</label>
                        <input className='input w-full'
                            type="email"
                            id="email"
                            name="email"
                            placeholder={user.email}
                            onChange={handleChange}
                        />
                    </p>

                    <p>
                        {/* <ImageUp /> */}
                        <label htmlFor="image" className='block'>Image:</label>
                        <input className='p-2 hover:file:cursor-pointer hover:file:bg-gray-200 focus:outline-none focus:file:outline-2 file:mr-4 file:rounded-full file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold'
                        // className='block input   border border-gray-300 '
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                        />
                    </p>
                </fieldset>

                <button className='btn mt-4 rounded-full' type="submit">
                    <Save className='inline mx-1' />
                    Save Changes
                </button>
            </form>

            <p className='my-2 ml-1 underline text-blue-900 hover:text-blue-400'>
                <a href="#">Need to reset your password?</a>
            </p>
        </div>
    );
};

export default ProfileForm;
