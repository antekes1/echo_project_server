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

const RoomPage = () => {
    const { id } = useParams();
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
                                {yourRequests.map(request => (
                                    <div key={request.id} className="rounded-xl border items-center justify-between p-2 flex w-1/2">
                                        <div>
                                        {/* {request.id} */}
                                        {request.type === "friend_request" && (
                                            <div>
                                            <h2>
                                                You have a new friend request by
                                            </h2>
                                            <p>@{request.friend_username} - {request.friend_name}</p>
                                            </div>
                                        )}
                                        {request.type === "storage_request" && (
                                            <div>
                                            <h2>
                                                You have a new storage request to
                                            </h2>
                                            <p>{request.storage_name} storage you are invited by {request.sender}</p>
                                            </div>
                                        )}
                                        {request.type === "calendar_event_request" && (
                                            <div>
                                            <h2>
                                                {request.sender} invited you to
                                            </h2>
                                            <p>{request.event_name} at {request.event_date}</p>
                                            </div>
                                        )}
                                        </div>
                                        <div className="flex flex-row">
                                            <button onClick={() => {respond_on_request("accept", request.id)}}>
                                                <Check className="mx-3" />
                                            </button>
                                            <button onClick={() => {respond_on_request("reject", request.id)}}>
                                                <CircleMinus className="mr-1" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            {/* // <div className="rounded-xl border justify-between p-2 flex w-1/2">
                            //     Bartek nowak
                            //     <div className="flex flex-row">
                            //     <UserMinus className="mx-3" />
                            //     <ContactRound className="mr-1" />
                            //     </div>
                            // </div> */}
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
export default RoomPage;