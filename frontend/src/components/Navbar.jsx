import { NavLink } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <nav className="mx-6 lg:mx-12 bg-brand-surface border-b border-brand-mauve rounded-[40px] px-8 py-4 mb-8 mt-8">
      <div className="w-full flex justify-between items-center lg:items-start">

          {/*LOGO*/}
          <NavLink to="/" className="flex items-center gap-2 mt-2.5">
            <img 
              src={logo} 
              alt="DiaScore Logo" 
              className="w-8 h-8 object-contain" 
            />
            <span className="text-xl font-black text-white tracking-tighter">DiaScore</span>
          </NavLink>

          {/*NAVIGATION*/}
          <div className="flex gap-10 text-sm font-medium py-2 pr-10">

            <NavLink
            to="/"
            className={({ isActive }) => `nav-tab ${isActive ? 'active-tab' : ''}`}>
            Analyze
            </NavLink>

            <NavLink
            to="/history"
            className={({ isActive }) => `nav-tab ${isActive ? 'active-tab' : ''}`}>
            Records History
            </NavLink>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;