import logo from "../assets/images/logo.png";
import logo_light from "../assets/images/logo_light.png";
import { MenuIcon, User2, Plus, Search, ArrowLeft, Bell, Icon, TrashIcon, Settings, LogOut, User, Moon, MoonIcon, SunDimIcon, ArrowUpFromLine, Check, Trash2, Megaphone, Users } from "lucide-react";
import { Button } from '../components/Button';
import { useState, useEffect } from 'react';
import { useSidebarContext } from '../contexts/SidebarContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SERVER_URL from "../settings";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import useColorMode from '../hooks/useColorMode.jsx';

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
              <NotificationsMenu />
              <Button onClick={() => {navigate("/create_storage/")}} size="icon" variant="ghost">
                <Plus/>
              </Button>
              <DropdownMenu />
            </div>
        </div>
        </div>
      );
}

type NavbarFirstSectionProps = {
  hidden?: Boolean
}

export function NavbarFirstSection({hidden = false}: NavbarFirstSectionProps) {
  const [colorMode, setColorMode] = useColorMode();
  const {toogle} = useSidebarContext()
  return (
    <div className={`dark:text-white gap-4 items-center flex-shrink-0 ${hidden ? "hidden" : "flex" }`}>
      <Button onClick={() => toogle()} variant="ghost" size="icon">
        <MenuIcon />
      </Button>
      <a href='/'>
        {colorMode === "light"?
        <img className='h-8' src={logo_light} alt='Echo' />
        :<img className='h-8' src={logo} alt='Echo' /> 
        }
      </a>
    </div>
  )
}

function DropdownMenu() {
  const token = localStorage.getItem("token");
  const [colorMode, setColorMode] = useColorMode();
  let navigate = useNavigate();
  const handleClick = () => {
    if (token === null) {
      navigate('/login');
    } else {
      navigate("/profile");
    }
  }
  const del_token = () => {
    if (token != null) {
      localStorage.removeItem("token");
      navigate("/login");
  }}
  return (
  <Menu>
  <MenuButton>
  <Button 
  size="icon" 
  variant="ghost"
  >
    <User2/>
  </Button>
  </MenuButton>
  <Transition
    enter="transition ease-out duration-75"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition ease-in duration-100"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
  >
    <MenuItems
      anchor="bottom end"
      className="w-52 bg-zinc-200 origin-top-right rounded-xl border border-white/5 dark:bg-slate-700 p-1 text-sm/6 dark:text-white text-black [--anchor-gap:var(--spacing-1)] focus:outline-none"
    > 
      <MenuItem>
        <button onClick={handleClick} className="group flex h-16 w-full justify-center items-center gap-2 rounded-lg py-1.5 px-3 dark:data-[focus]:bg-white/10 data-[focus]:bg-slate-800/10 mb-1">
          <User className="rounded-3xl border dark:border-white border-black p-1 w-9 h-9" />
          {token === null?
          "Log in":
          "User page"
          }
        </button>
      </MenuItem>
      <button onClick={
        () => {
          if(colorMode === "dark") {
            setColorMode("light");
          } else {
            setColorMode("dark");
          }
        }
      } className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 dark:data-[focus]:bg-white/10 data-[focus]:bg-slate-800/10">
        {colorMode === "dark"?
        <MoonIcon />
        :<SunDimIcon />
        }
        {colorMode}
        {/* <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd> */}
      </button>
      <MenuItem>
        <button onClick={() => {navigate("/friends")}} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 dark:data-[focus]:bg-white/10 data-[focus]:bg-slate-800/10">
          <Users className="size-5 fill-white/30" />
          Friends
          {/* <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd> */}
        </button>
      </MenuItem>
      <MenuItem>
        <button onClick={() => {navigate("/settings")}} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 dark:data-[focus]:bg-white/10 data-[focus]:bg-slate-800/10">
          <Settings className="size-5 fill-white/30" />
          Settings
          {/* <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd> */}
        </button>
      </MenuItem>
      <div className="my-1 h-px bg-white/5" />
      {token === null?
      undefined
      :
        <MenuItem>
          <button onClick={del_token} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 dark:data-[focus]:bg-white/10 data-[focus]:bg-slate-800/10">
            <LogOut className="size-5 fill-white/30" />
            Log out
            {/* <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘A</kbd> */}
          </button>
        </MenuItem>
      }
    </MenuItems>
  </Transition>
</Menu>
)
}

function NotificationsMenu() {
  const token = localStorage.getItem("token");
  const [colorMode, setColorMode] = useColorMode();
  let navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const get_storage_data = async () => {
    const token = localStorage.getItem("token");
    if (token === null) {
    } else {
        try {
          const data = {
            token: token
          };
          const response = await fetch(`${SERVER_URL}notifications-api/get_notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          if (response.ok) {
            const responseBody = await response.json();
            console.log(responseBody.data);
            setNotifications(responseBody.data);
          }
        } catch (error) {
          alert(error);
        }
    }
  };

  useEffect(() => {
    get_storage_data();
  }, []);

  const deleteNotification =  async (notification_id) => {
    const token = localStorage.getItem("token");
    if (token === null) {
    } else {
        try {
          const data = {
            token: token,
            notification_id: notification_id,
          };
          const response = await fetch(`${SERVER_URL}notifications-api/del_notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          if (response.ok) {
            const responseBody = await response.json();
            console.log(responseBody.data);
          }
        } catch (error) {
          alert(error);
        }
    }
    get_storage_data();
  };

  return (
  <Menu>
  <MenuButton>
  <Button 
  size="icon" 
  variant="ghost"
  >
    <Bell/>
  </Button>
  </MenuButton>
  <Transition
    enter="transition ease-out duration-75"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition ease-in duration-100"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
  >
    <MenuItems
      anchor="bottom end"
      className="w-72 bg-zinc-200 origin-top-right rounded-xl border border-white/5 dark:bg-slate-700 p-1 text-sm/6 dark:text-white text-black [--anchor-gap:var(--spacing-1)] focus:outline-none"
    > 
    <div className="p-1">
      <h1 className="m-1 mb-3 text-2xl">Notifications</h1>
      {notifications.map(notifi => {
        // <h1 key={notifi["request_id"]}>{notifi["body"]}</h1>
        if (notifi["type"] === "request") {
        return (
        notifi["type"] === "request" ? (
          <div className="border rounded-lg p-2 flex-row flex justify-between items-center my-2">
            <ArrowUpFromLine />
            <div className="ml-1 flex w-32 justify-center">
              {notifi["body"]}
            </div>
            <div className="flex flex-row">
            <Button onClick={() => deleteNotification(notifi["id"])} 
            className="" variant="ghost" size="icon">
              <Trash2 />
            </Button>
            <Button onClick={() => {
              navigate('/requests');
              deleteNotification(notifi["id"]);
            }} className="" variant="ghost" size="icon">
              <Check />
            </Button>
            </div>
          </div>
        ) : null )
        } else if (notifi["type"] === "text") {
        notifi["type"] === "text" ? (
          <div className="border rounded-lg p-2 flex-row flex justify-between items-center my-2">
            <Megaphone />
            <div className="ml-1">
              {notifi["body"]}
            </div>
            <Button
            onClick={() => deleteNotification(notifi["id"])}
            className="ml-2" variant="ghost" size="icon">
              <Trash2 />
            </Button>
          </div>
        ) : null
        } else {
          return null; // Return nothing if the type is not "request" or "text"
        }
      })}
      {/* <div className="border rounded-lg p-2 flex-row flex justify-between items-center my-2">
        <Megaphone />
        <div className="ml-1">
          Bodyaa
        </div>
        <Button className="ml-2" variant="ghost" size="icon">
          <Trash2 />
        </Button>
      </div>
      <div className="border rounded-lg p-2 flex-row flex justify-between items-center my-2">
        <ArrowUpFromLine />
        <div className="ml-1 flex w-32 justify-center">
          You have a new request
        </div>
        <div className="flex flex-row">
        <Button className="" variant="ghost" size="icon">
          <Trash2 />
        </Button>
        <Button className="" variant="ghost" size="icon">
          <Check />
        </Button>
        </div>
      </div> */}
    </div>
    </MenuItems>
  </Transition>
</Menu>
)
}

export default Navbar