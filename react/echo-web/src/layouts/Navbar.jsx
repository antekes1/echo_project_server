import logo from '../assets/images/logo.png'
import { Menu, User2, Plus, Search, ArrowLeft } from "lucide-react"
import { Button } from '../components/Button';
import { useState } from 'react';

const Navbar = () => {
  const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)
    return (
        <div className="flex gap-10 lg:gap-20 justify-between pt-2 mb-6 mx-4">
            <div className={`gap-4 items-center flex-shrink-0 ${showFullWidthSearch ? "hidden" : "flex" }`}>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
              <a href='/'>
              <img className='h-8' src={logo} alt='Echo' />
              </a>
            </div>
            <form className={`gap-4 flex-grow justify-center ${showFullWidthSearch ? "flex" : "hidden md:flex"}`}>
              {showFullWidthSearch && (<Button type="button" size="icon" variant="ghost" className="flex-shrink-0" onClick={() => setShowFullWidthSearch(false)}>
                <ArrowLeft/>
              </Button>)}
              <div className="flex flex-grow max-w-[600px]">
                <input type="search" placeholder="Search" className="rounded-l-full border border-secondary-border shadow-inner shadow-secondary py-1 px-3 text-lg w-full focus:border-blue-500 outline-none" />
                <Button className='py-2 px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0'>
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
              <Button size="icon" variant="ghost">
                <User2/>
              </Button>
              </div>
            </div>
      );
}

export default Navbar