import logo from "../assets/images/logo.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../hooks/useColorMode.jsx"
import SERVER_URL from "../settings.jsx";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [ver_pin, setVer_pin] = useState('');
    const navigate = useNavigate();
    const [colorMode, setColorMode] = useColorMode();
    const register_user = async () => {
        if (!email || !name || !username || !password || !password2 || !ver_pin) {
            alert("Please fill in all required fields");
            return;
        }
        if (password != password2) {
            alert("Passwords don't match")
        } else {
            try {
                const data = {
                    username: username,
                    email: email,
                    name: name,
                    password: password2,
                    veryfication_code: ver_pin,
                };
                const response = await fetch(`${SERVER_URL}auth/register`, {
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
                navigate("/");
            } catch (error) {
                console.error("Catch Error:", error);
                const errorDetail = JSON.parse(error.message.split(': ')[1]).detail;
                alert(errorDetail);
            };
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
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/'); // Przekieruj użytkownika do strony logowania, jeśli brakuje tokenu
        }
    }, [navigate]);

    return (
        <div className="h-full grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-auto dark:bg-gray-900 dark:text-white">
                <div className="w-full lg:flex items-center justify-center lg:w-full mb-20 hidden">
                    <div className=" px-10 py-20 rounded-3xl mr-24">
                        <img src={logo} alt="logo" className="h-20" />
                        <h1 className="text-5xl font-semibold mt-4">
                        Create your account
                        </h1>
                        <p className="font-medium text-lg text-gray-500 mt-4">
                        Welcome! Please enter your details.
                        </p>
                    </div>
                    <div className="px-20 py-16 rounded-3xl border-2 border-violet-700">
                        <div className="mt-8">
                                <div className="mb-4">
                                    <label className="text-lg font-medium">email</label>
                                    <input id='email'
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">name</label>
                                    <input id='name'
                                    name="name"
                                    type="name"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)} />
                                </div>
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
                                <div className="mb-4">
                                    <label className="text-lg font-medium">Re-enter password</label>
                                    <input id='password2' 
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Re-enter password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">Verification code</label>
                                    <input id='ver_pin' 
                                    name="ver_pin"
                                    type="ver_pin"
                                    required
                                    className="w-1/3 border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent ml-5"
                                    placeholder="code"
                                    value={ver_pin}
                                    onChange={(e) => setVer_pin(e.target.value)} />
                                    <Button onClick={handleSendPin} className="ml-4 rounded-lg p-3">
                                        Send pin
                                    </Button>
                                </div>
                                <div className="gap-y-4 flex flex-col w-full items-center">
                                    <Button onClick={register_user} type="submit" className="active:scale-[.98] hover:scale-[1.01] hover:bg-violet-400 active:duration-75 py-4 rounded-xl bg-violet-500 text-white text-lg font-bold items-center w-5/6">
                                        Register
                                    </Button>
                                </div>
                            <p className="text-small-regular text-light-2 text-center mt-8">
                                You have an account?
                                <a href='/login' className="text-violet-500 text-small-semibold ml-2">Log in</a>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-auto lg:hidden items-center justify-center lg:w-full p-20 m-20 flex">
                    <div className="px-10 py-8 rounded-3xl border-2 border-black dark:border-white">
                        <img src={logo} alt="logo" className="h-20" />
                        <h1 className="text-5xl font-semibold mt-4">
                        Create your account
                        </h1>
                        <p className="font-medium text-lg text-gray-500 mt-4">
                        Welcome! Please enter your details.
                        </p>
                        <div className="mt-8">
                                <div className="mb-4">
                                    <label className="text-lg font-medium">email</label>
                                    <input id='email.2'
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">name</label>
                                    <input id='name.2'
                                    name="name"
                                    type="name"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">username</label>
                                    <input id='username.2'
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
                                    <input id='password.2' 
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">Re-enter password</label>
                                    <input id='password2.2' 
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                                    placeholder="Re-enter password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-lg font-medium">Verification code</label>
                                    <input id='ver_pin2' 
                                    name="ver_pin"
                                    type="ver_pin"
                                    required
                                    className="w-1/3 border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent ml-5"
                                    placeholder="code"
                                    value={ver_pin}
                                    onChange={(e) => setVer_pin(e.target.value)} />
                                    <Button onClick={handleSendPin} className="ml-4 rounded-lg p-3">
                                        Send pin
                                    </Button>
                                </div>
                                <div className="gap-y-4 flex flex-col w-full items-center">
                                    <Button onClick={register_user} type="submit" className="active:scale-[.98] hover:scale-[1.01] hover:bg-violet-400 active:duration-75 py-4 rounded-xl bg-violet-500 text-white text-lg font-bold items-center w-5/6">
                                        Register
                                    </Button>
                                </div>
                            <p className="text-small-regular text-light-2 text-center mt-8">
                                You have an account?
                                <a href='/login' className="text-violet-500 text-small-semibold ml-2">Log in</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default RegisterPage;