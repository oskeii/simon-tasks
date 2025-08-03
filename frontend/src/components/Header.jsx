import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Header = () => {
    const { auth, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="flex justify-between items-center py-2 px-6 text-white bg-gray-800 rounded-md shadow-md shadow-black">
            <div className='lowercase tracking-tighter'>
                <h2>
                    <NavLink
                        to="/"
                        end
                    >
                        Simon Tasks
                    </NavLink>
                </h2>
            </div>


            <nav className="grow ml-10 p-2">
                <ul className="flex gap-6 font-medium text-gray-300 *:has-[.active]:text-white *:has-[.active]:bg-gray-900  *:rounded-md *:px-3 *:py-2 *:hover:bg-gray-700 *:hover:text-white">
                    <li>
                        <NavLink
                            to="/profile" end
                        >
                            Profile
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                            to="/tasks"
                        >
                            Tasks
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                            to="/organizer" end
                        >
                            Organizers
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                            to="/calendar" end
                        >
                            Calendar
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                            to="/timer" end
                        >
                            Timer
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/stats"
                        >
                            Stats
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
