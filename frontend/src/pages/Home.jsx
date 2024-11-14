import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';  // Redirect to login page
  };

  const CheckLogin = () => {
    if (localStorage.getItem('access_token') == null) {
      return <Link to='/login'><button>Login here</button></Link>
    } else {
      return (<button onClick={handleLogout}>Logout</button>)
    }
  }

  return (
    <div>
        <h1>Welcome</h1>
        <div>
          <CheckLogin />
        </div>
        
    </div>
  )
}

export default Home