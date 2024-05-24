import logo from "../assets/images/logo.png";
import { Menu, User2, Plus, Search, ArrowLeft } from "lucide-react"
import { Button } from '../components/Button';
import { useState } from 'react';
import { useSidebarContext } from '../contexts/SidebarContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)
  const token = localStorage.getItem("token");
  let navigate = useNavigate();
  const handleClick = () => {
    if (token === null) {
      navigate('/login');
    }
};
    return (
        <div className="dark:bg-gray-900 bg-white dark:text-white text-black">
        <div className="flex gap-10 lg:gap-20 justify-between pt-2 mb-6 mx-4">
            <NavbarFirstSection hidden={showFullWidthSearch}/>
            <form className={`gap-4 flex-grow justify-center ${showFullWidthSearch ? "flex" : "hidden md:flex"}`}>
              {showFullWidthSearch && (<Button type="button" size="icon" variant="ghost" className="flex-shrink-0" onClick={() => setShowFullWidthSearch(false)}>
                <ArrowLeft/>
              </Button>)}
              <div className="flex flex-grow max-w-[600px]">
                <input type="search" placeholder="Search" className="dark:text-white dark:bg-slate-800 rounded-l-full border border-secondary-border shadow-inner shadow-secondary dark:shadow-black py-1 px-3 text-lg w-full focus:border-blue-500 outline-none" />
                <Button className='py-2 px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0 dark:bg-gray-700'>
                  <Search/>
                </Button>
              </div>
            </form>
            <div className={`flex-shrink-0 md:gap-2 ${showFullWidthSearch ? "hidden" : "flex" }`}>
              <Button size="icon" variant="ghost" className='md:hidden' onClick={() => setShowFullWidthSearch(true)}>
                <Search/>
              </Button>
              <Button size="icon" variant="ghost">
                <Plus/>
              </Button>
              <Button 
              size="icon" 
              variant="ghost"
              onClick={handleClick}
              >
                <User2/>
              </Button>
            </div>
        </div>
        </div>
      );
}

type NavbarFirstSectionProps = {
  hidden?: Boolean
}

export function NavbarFirstSection({hidden = false}: NavbarFirstSectionProps) {
  const {toogle} = useSidebarContext()
  return (
    <div className={`dark:text-white gap-4 items-center flex-shrink-0 ${hidden ? "hidden" : "flex" }`}>
      <Button onClick={() => toogle()} variant="ghost" size="icon">
        <Menu />
      </Button>
      <a href='/'>
        <img className='h-8' src={logo} alt='Echo' />
      </a>
    </div>
  )
}

export default Navbar