import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <div className='flex flex-col max-w-11/12 mx-auto pb-0.5 bg-neutral-50 border-1 border-neutral-900/50 rounded-md shadow-lg'>
            <Header />
            <main className='ml-3 mt-3  pb-4'>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
