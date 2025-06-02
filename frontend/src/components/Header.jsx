import React from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth';


const Header = () => {
  const { auth, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  }

  return (
    <header className='app-header'>
      <div className='header-branding'>
        <h2>
          <NavLink to="/" end>
            ToDo App
          </NavLink>
        </h2>
      </div>

      <nav className='main-nav'> 
        <ul className='nav-links'>
          <li>
            <NavLink to="/profile" end className={({ isActive }) => isActive ? 'active' : ''}>
            Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/tasks" end className={({ isActive }) => isActive ? 'active' : ''}>
            Tasks
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar" end className={({ isActive }) => isActive ? 'active' : ''}>
            Calendar
            </NavLink>
          </li>
          <li>
            <NavLink to="/timer" end className={({ isActive }) => isActive ? 'active' : ''}>
            Timer
            </NavLink>
          </li>
          <li>
            <NavLink to="/stats" end className={({ isActive }) => isActive ? 'active' : ''}>
            Stats
            </NavLink>
          </li>
          
          {/* <NavLink to="/tasks" className="active">
            <li>Tasks</li>
          </NavLink>
          <NavLink to="/profile" className="active">
            <li>Profile</li>
          </NavLink>
          <li>Calendar</li> */}
        </ul>
      </nav>          

    </header>
      
  );
};

export default Header