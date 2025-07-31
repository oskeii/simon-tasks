import React, { useState, useEffect } from 'react';
import useProfile from '../context/ProfileContext';
import useApiService from '../services/apiService';

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
        <div className="user-info-edit">
            <form
                id="profile-form"
                method="POST"
                encType="multipart/form-data"
                onSubmit={submitUpdate}
            >
                <fieldset>
                    <legend>Profile Info</legend>
                    <p>
                        <label htmlFor="first_name">
                            First Name:
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                placeholder={user.first_name}
                                onChange={handleChange}
                            />
                        </label>
                    </p>
                    <p>
                        <label htmlFor="last_name">
                            Last Name:
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                placeholder={user.last_name}
                                onChange={handleChange}
                            />
                        </label>
                    </p>
                    <p>
                        <label htmlFor="username">
                            Username:
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder={user.username}
                                onChange={handleChange}
                            />
                        </label>
                    </p>
                    <p>
                        <label htmlFor="email">
                            Email:
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={user.email}
                                onChange={handleChange}
                            />
                        </label>
                    </p>

                    <p>
                        <label htmlFor="image">
                            Image:
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                            />
                        </label>
                    </p>
                </fieldset>
                <button type="submit">Update</button>
            </form>
            <p>
                <a href="#">Need to reset your password?</a>
            </p>
        </div>
    );
};

export default ProfileForm;
