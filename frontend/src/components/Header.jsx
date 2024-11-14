import React from 'react'
import { NavLink } from 'react-router-dom'


const Header = () => {
  return (
    <div>

      <header>
        <h3>To-Do</h3>

        <div className="container">
          <nav>
            <ul>
              <NavLink to="/" end className="active">
                <li>Home</li>
              </NavLink>
              <NavLink to="/tasks" className="active">
                <li>Tasks</li>
              </NavLink>
              <li>Profile</li>
              <li>Calendar</li>
            </ul>
          </nav>          
        </div>

      </header>
      
    </div>
  );
};

export default Header