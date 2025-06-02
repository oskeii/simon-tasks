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
import TaskDetail from './pages/TaskDetail'
import Organizer from './pages/Organizer'



function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                {/* Auth routes */}
                <Route path='/register' element={<Register key={"register"}/>} />
                <Route path='/login' element={<Login key={"login"}/>} />
            
                {/* All content routes - (PersistLogin) */}
                <Route element={<PersistLogin />}>
                    {/* public routes */}
                    <Route path='/' element={<Home key={"home"}/>} />  
                    

                    {/* protected routes */}
                    <Route element={<RequireAuth />}>
                        <Route path='/profile' element={<Profile key={"profile"}/>} />
                        <Route path='/tasks' element={<TaskList key={"tasks"}/>} />
                        <Route path='/tasks/:taskId' element={<TaskDetail key={"task-detail"}/>} />
                        <Route path='/organizer' element={<Organizer key={"organizer"}/>} />
                    </Route>
                    
                    {/* catch all */}
                    <Route path='*' element={<Missing />} />
                </Route>

            </Route>
        </Routes>
        
    )
}

export default App
