import user from "../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ContactRound, Search, UserMinus, UserPlus } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../hooks/useColorMode.jsx'
import SERVER_URL from "../settings.jsx";

const RequestsPage = () => {
    const [colorMode, setColorMode] = useColorMode();
    const [userdata, setUserData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [yourRequests, setYourRequests] = useState([]);
    const token = localStorage.getItem("token");

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funkcja do pokazania wyników po kliknięciu przycisku
    const handleSearch = async () => {
        try {
            const data = {
                search_text: searchTerm,
            };
            const response = await fetch(`${SERVER_URL}user/search_users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
    
            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            const responseBody = await response.json();
            setSearchResults(responseBody["data"])
          } catch (error) {
            alert(error);
        }
        setShowResults(true);
    };

    const get_user_data = async () => {
        if (token === null) {}
        else {
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
              } catch (error) {
                alert(error);
            }
        }
    };

    useEffect(() => {
        console.log('useEffect triggered');
        const fetchData = async () => {
            try {
                await get_user_data();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:text-white bg-white dark:bg-gray-900">
                <div className="flex w-full h-screen flex-col items-center">
                    <h1 className="text-4xl font-bold p-5 dark:text-white">Requests</h1>
                    <div className="flex w-full">
                    <div className="hidden w-full lg:w-1/3 h-full lg:flex flex-row">
                        <div className="w-3/4 flex h-fit flex-col items-center p-2 border-2 rounded-3xl border-violet-300">
                            <div className="p-2 rounded-full border-2 border-violet-500 mt-10 dark:bg-white">
                                <img src={user} className="h-20 rounded-full"/>
                            </div>
                            <h1 className="mt-4">{userdata.username? `@${userdata.username}` :"@username"}</h1>
                            <p>{userdata.name? userdata.name :"Please login"}</p>
                            <h1 className="border-2 px-2 rounded-3xl border-x-violet-500 border-y-violet-300">{userdata.email? `${userdata.email}` :"Please login"}</h1>
                        </div>
                    </div>
                    <div className="flex w-full lg:w-2/3 items-center flex-col justify-center">
                        {/* searched users */}
                            <div className="flex w-full items-center flex-col">
                                <h2 className="mb-2">Your requests:</h2>
                                {/* {friendsInfo.map(({ friend, friendInfo }) => (
                                    <div key={friend} className="rounded-xl border justify-between p-2 flex w-1/2">
                                        {friendInfo}
                                        <div className="flex flex-row">
                                            <UserMinus className="mx-3" />
                                            <ContactRound className="mr-1" />
                                        </div>
                                </div> */}
                            {/* <div className="rounded-xl border justify-between p-2 flex w-1/2">
                                Bartek nowak
                                <div className="flex flex-row">
                                <UserMinus className="mx-3" />
                                <ContactRound className="mr-1" />
                                </div>
                            </div> */}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default RequestsPage;