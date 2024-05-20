import logo from "../assets/images/logo.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../hooks/useColorMode.jsx"

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [colorMode, setColorMode] = useColorMode();
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:bg-gray-900 bg-white dark:text-white">
                <div className="w-full flex items-center justify-center lg:w-1/2 mb-20">
                    <div className="px-10 py-20 rounded-3xl border-2 border-black dark:border-white">
                        <img src={logo} alt="logo" className="h-20" />
                        <h1 className="text-5xl font-semibold mt-4">
                        Log in to your account
                        </h1>
                        <p className="font-medium text-lg text-gray-500 mt-4">
                        Welcome back! Please enter your login details.
                        </p>
                        <div className="mt-8 ">
                            <form>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">username</label>
                                    <input id='username'
                                    name="username"
                                    type="username"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">password</label>
                                    <input id='password' 
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="gap-y-4 flex flex-col w-full items-center">
                                    <Button type="submit" className="active:scale-[.98] hover:scale-[1.01] hover:bg-violet-400 active:duration-75 py-4 rounded-xl bg-violet-500 text-white text-lg font-bold items-center w-5/6">
                                        Log in
                                    </Button>
                                </div>

                                <p className="text-small-regular text-light-2 text-center mt-8">
                                    Don't have an account?
                                    <a href='/register' className="text-violet-500 text-small-semibold ml-2">Sign up</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center">
                    <div className="bg-gray-200 rounded-3xl border-2 border-violet-500 p-8">
                        <div className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce"/>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default LoginPage;