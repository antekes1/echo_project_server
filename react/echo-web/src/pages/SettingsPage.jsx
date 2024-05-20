import user from "../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import {  } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../hooks/useColorMode.jsx'

const SettingsPage = () => {
    const [colorMode, setColorMode] = useColorMode();
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:text-white bg-white dark:bg-gray-900">
                <div className="flex w-full h-screen flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold p-5 dark:text-white">Settings</h1>
                    <div className="w-full h-full flex lg:flex-row flex-col">
                        <div className="lg:w-1/4 w-full flex h-fit flex-col items-center p-2 border-2 rounded-3xl border-violet-300">
                            <div className="p-2 rounded-full border-2 border-violet-500 mt-10 dark:bg-white">
                                <img src={user} className="h-20 rounded-full"/>
                            </div>
                            <h1 className="mt-4">@username</h1>
                            <p>Imię i nazwisko</p>
                            <h1 className="border-2 px-2 rounded-3xl border-x-violet-500 border-y-violet-300">email@email.pl</h1>
                        </div>
                        <div className="lg:w-3/4 w-full flex p-4 flex-col items-center">
                            <div className="flex flex-row justify-between">
                                <h1>mode settings:</h1>
                                <button onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")} className="p-2 bg-red-500 dark:bg-sky-600 text-black dark:text-white">Toogle theme</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SettingsPage;