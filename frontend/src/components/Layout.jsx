import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <div className='max-w-11/12 mx-auto pb-0.5 bg-amber-100 border-1 border-amber-900/50 rounded-md shadow-lg'>
            <Header />
            <main className='bg-stone-50 m-3 pb-4'>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
