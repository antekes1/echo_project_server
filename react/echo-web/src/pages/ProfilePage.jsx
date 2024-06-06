import user from "../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import {  } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../hooks/useColorMode.jsx'
import SERVER_URL from "../settings.jsx";

const ProfilePage = () => {
    const [updateData, setupdateData] = useState(false);
    const [colorMode, setColorMode] = useColorMode();
    const [userdata, setUserData] = useState({});
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [ver_code, setVerCode] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const get_user_data = async () => {
        try {        
            const response = await fetch(`${SERVER_URL}user/${token}`, {
              method: 'GET',
            })
    
            if (!response.ok) {
                // Response is not OK, handle the error
                const errorText = await response.text(); 
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            const responseBody = await response.json();
            setUserData(responseBody);
            setName(responseBody.name);
            setUsername(responseBody.username);
            setEmail(responseBody.email)
          } catch (error) {
            alert(error);
            navigate("/");
        }
    };
    const update_user_info = async () => {
        try {
            if (email === "") {
                setEmail("None");
            }
            const data = {
                token: token,
                name: name,
                username: username,
                email: email,
            };
    
            console.log("Request Data:", data);
    
            const response = await fetch(`${SERVER_URL}user/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                // Response is not OK, handle the error
                const errorText = await response.text(); 
                console.error("Error Response:", errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            const responseBody = await response.json();
            alert(responseBody.msg);
            get_user_data();
        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                console.error("Fetch failed. Possible causes: network issues, CORS issues, server downtime, or incorrect URL.");
            }
            console.error("Catch Error:", error);
            alert(error);
        }
    };
    const handleSendPin = async (e) => {
        if (!email) {
          alert('Please enter the email.');
          e.preventDefault();
        } else {
            e.preventDefault();
            try {
                const data = {
                    email: email
                };
                const response = await fetch(`${SERVER_URL}auth/create_verification_request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
        
                if (!response.ok) {
                    // Response is not OK, handle the error
                    const errorText = await response.text(); 
                    console.error("Error Response:", errorText);
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }
                const responseBody = await response.json();
                alert(responseBody.msg);
            } catch (error) {
                alert(error);
            };
        }
    };  
    useEffect(() => {
        console.log('useEffect triggered');
        get_user_data();
    }, []);
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:bg-gray-900 bg-white dark:text-white">
                <div className="flex w-full h-screen lg:flex-row flex-col">
                    <div className="lg:w-1/3 w-full flex lg:h-screen h-fit flex-col items-center p-2 border-2 rounded-3xl border-violet-300">
                        <div className="p-2 rounded-full border-2 border-violet-500 mt-10 dark:bg-white">
                            <img src={user} className="h-20 rounded-full"/>
                        </div>
                        <h1 className="mt-4">@{userdata.username}</h1>
                        <p>{userdata.name}</p>
                        <h1 className="border-2 px-2 rounded-3xl border-x-violet-500 border-y-violet-300">
                            {userdata.email}
                        </h1>
                        <button onClick={() => setupdateData(e => !e)} className="mt-4 py-2 px-4 rounded-full border border-blue-500 bg-gradient-to-tr from-violet-500 to-pink-500 text-white hover:bg-violet-400 active:duration-75 active:scale-[.98] hover:scale-[1.01] font-bold">
                            Update data
                        </button>
                    </div>
                    <div className="lg:w-2/3 flex-col items-center p-2 flex w-full">
                        <div className={`flex-col ${updateData ? "flex" : "hidden"} w-full px-10`}>
                            <h1 className="font-bold text-lg pb-5">Change user data</h1>
                            <div className="mb-2">
                                <label className="text-lg font-medium">username</label>
                                <input id='username'
                                name="username"
                                type="username"
                                required
                                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent hover:border-violet-400"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                />
                            </div>
                            <div className="mb-2">
                                <label className="text-lg font-medium">name</label>
                                <input id='name' 
                                name="name"
                                type="name"
                                required
                                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent hover:border-violet-400"
                                placeholder="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)} 
                                />
                            </div>
                            <div className="mb-2">
                                <label className="text-lg font-medium">email</label>
                                <input id='email'
                                name="email"
                                type="email"
                                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent hover:border-violet-400"
                                placeholder="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <h1>If you want to change email you must verify it, if you don't just ignore this entry</h1>
                            <div className="mb-2">
                                <label className="text-lg font-medium">Veryfication code</label>
                                <div className="flex flex-row">
                                <input id='ver_code'
                                name="ver_code"
                                type="ver_code"
                                className="w-1/2 border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent hover:border-violet-400"
                                placeholder="code"
                                value={ver_code}
                                onChange={(e) => setVerCode(e.target.value)}
                                />
                                <Button onClick={handleSendPin} className="ml-4 rounded-lg p-3">
                                    Send code
                                </Button>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center">
                            <button onClick={update_user_info} className="w-2/4 mt-4 py-2 px-4 rounded-full border border-blue-500 bg-violet-500 text-white hover:bg-violet-400 active:duration-75 active:scale-[.98] hover:scale-[1.01] font-bold">
                                Update data
                            </button>
                            </div>
                        </div>
                        <div className={`flex-col ${updateData ? "hidden" : "flex"} w-full lg:h-screen px-10 items-center justify-center`}>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl border-2 border-violet-500 p-36">
                                <div className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-spin"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;