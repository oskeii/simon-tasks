import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import TaskList from "./pages/TaskList"


function App() {
    return (
        <>
        <Router>
            <Header />

        
            <Routes>
                <Route path='/' element={<Home key={"home"}/>} />  
                <Route path='/login' element={<Login key={"login"}/>} />
                <Route path='/tasks' element={<TaskList key={"tasks"}/>} />
            </Routes>
        </Router>        
        </>

        
    )
}

export default App
