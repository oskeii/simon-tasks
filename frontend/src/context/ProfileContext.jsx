import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext();

const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState([]);
    const [user, setUser] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const updateProfile = (data) => {
        console.log('updatING Profile deets');
        setProfile(data);
        setUser(data.user);
        console.log('updateD Profile deets');
    };
    const refreshProfile = () => {
        console.log('REFRESHHH PROFILE');
        if (refresh) {
            setRefresh(false);
        } else {
            setRefresh(true);
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                profile,
                setProfile,
                user,
                setUser,
                refresh,
                refreshProfile,
                updateProfile,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export default useProfile;
