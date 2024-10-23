import user from "../../assets/images/user.png"
import React, { act, useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Check, ContactRound, Search, UserMinus, UserPlus, CircleMinus } from 'lucide-react';
import { Sidebar } from '../../layouts/Sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../../hooks/useColorMode.jsx'
import SERVER_URL from "../../settings.jsx";
import Toast from "../../components/liveToast.jsx";

const MessagesRoomPage = () => {
    const [colorMode, setColorMode] = useColorMode();
    const [showTost, setShowTost] = useState(false);
    const [toastContent, setToastContent] = useState({ title: "", body: ""});
    const [userdata, setUserData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [yourRequests, setYourRequests] = useState([]);
    const token = localStorage.getItem("token");

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleShowToast = (title, body, icon = null) => {
        setToastContent({ title, body, icon });
        setShowTost(true);
        setTimeout(() => {
          setShowTost(false);
        }, 7000);
    };

    const respond_on_request = async (action, request_id) => {
        try {
            const data = {
                token: token,
                request_id: request_id,
                action: action,
            };
            const response = await fetch(`${SERVER_URL}api-request/reply_on_request`, {
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
            if (responseBody["msg"] === "success") {
                if(action === "accept") {
                handleShowToast("success", "Request accepted sucessfully", <Check className="text-green-600" />);
                } else {
                    handleShowToast("success", "Request rejected sucessfully", <Check className="text-green-600" />);
                }
            } else {
                handleShowToast(responseBody["msg"], "", <Check className="text-green-600" />);
            }
            get_requests();
          } catch (error) {
            alert(error);
        }
        setShowResults(true);
    };

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

    const get_requests = async () => {
        try {
            const data = {
                token: token,
            };
            const response = await fetch(`${SERVER_URL}api-request/get_requests`, {
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
            setYourRequests(responseBody["data"])
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
                get_requests();
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
                    <h1 className="text-4xl font-bold p-5 dark:text-white">Chats: </h1>
                    <div className="flex w-full">
                    <div className="flex w-full items-center flex-col justify-center">
                        {/* np storki i inne paski u góry  */}
                        {/* dostępne chaty */}
                        <div className="flex w-full justify-center">
                            {/* jedne element */}
                            <div className="flex justify-start items-center w-2/3 border rounded-2xl px-6 py-2 m-1">
                                <img alt="@" className="mr-4" />
                                <h1>Bartek jakiś</h1>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                    {showTost && (
                        <Toast
                        title={toastContent.title} 
                        body={toastContent.body} 
                        setShowToast={setShowTost}
                        icon={toastContent.icon}
                    />
                    )}
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MessagesRoomPage;