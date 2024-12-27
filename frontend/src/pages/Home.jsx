import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useLogout from '../hooks/useLogout';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { auth } = useAuth()
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate('/');  // Redirect to login page
  };

  const AuthButton = () => {
    if (!auth?.username) {
      return <Link to='/login'><button>Login here</button></Link>
    } else {
      return (<button onClick={handleLogout}>Logout</button>)
    }
  }

  return (
    <div>
        {auth?.username
        ?<h2>Hello, {auth.username}!</h2>
        :<h1>Welcome</h1>}
        
        <div>
          <AuthButton />
        </div>
        
    </div>
  )
}

export default Home