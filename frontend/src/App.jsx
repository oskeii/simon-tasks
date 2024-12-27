import './App.css'
import { Routes, Route} from "react-router-dom"
import RequireAuth from './components/RequireAuth'
import PersistLogin from './components/PersistLogin'
import Missing from './pages/Missing'
import Home from './pages/Home'
import Login from './pages/Login'
import TaskList from "./pages/TaskList"
import Profile from './pages/Profile'
import Register from './pages/Register'
import Layout from './components/Layout'



function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                {/* public routes */}
                <Route path='/' element={<Home key={"home"}/>} />  
                <Route path='/register' element={<Register key={"register"}/>} />
                <Route path='/login' element={<Login key={"login"}/>} />

                {/* protected routes */}
                <Route element={<PersistLogin />}>
                    <Route element={<RequireAuth />}>
                        <Route path='/profile' element={<Profile key={"profile"}/>} />
                        <Route path='/tasks' element={<TaskList key={"tasks"}/>} />
                    </Route>
                </Route>

                {/* catch all */}
                <Route path='*' element={<Missing />} />
            </Route>
        </Routes>
        
    )
}

export default App
