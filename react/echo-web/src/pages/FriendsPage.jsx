import user from "../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ContactRound, Search, UserMinus, UserPlus, Check } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../hooks/useColorMode.jsx'
import SERVER_URL from "../settings.jsx";
import Toast from "../components/liveToast.jsx";

const FriendsPage = () => {
    const [colorMode, setColorMode] = useColorMode();
    const [showTost, setShowTost] = useState(false);
    const [toastContent, setToastContent] = useState({ title: "", body: ""});
    const [userdata, setUserData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [yourFriends, setyourFriends] = useState([]);
    const [yourFirndsData, setyourFriendData] = useState([]);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [searchresults, setSearchResults] = useState([]);
    const token = localStorage.getItem("token");

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleShowToast = (title, body, icon = null) => {
        setToastContent({ title, body, icon });
        setShowTost(true);
        setTimeout(() => {
          setShowTost(false);
        }, 7000); // Auto-close the toast after 3 seconds
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
                setyourFriends(responseBody["friends"]);
                for (const friend of responseBody["friends"]) {
                    const username = await get_user_info(friend); // Pobieramy nazwę użytkownika
                    yourFirndsData[friend] = username;
                    console.log("tak")
                }
              } catch (error) {
                alert(error);
            }
        }
    };

    const add_friend = async (to_add_username) => {
        if (token === null) {}
        else {
            try {
                const data = {
                    token: token,
                    username: to_add_username,
                };
                const response = await fetch(`${SERVER_URL}user/add_friend`, {
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
                    handleShowToast("success", "Friend request sent succesfully", <Check className="text-green-600" />);
                }
            } catch (error) {
                alert(error);
            }
        }
    };

    
    const get_user_info = async (id) => {
        try {
            const response = await fetch(`${SERVER_URL}user/get/${id}`, {
                method: 'GET',
            })
        
            if (!response.ok) {
                    // Response is not OK, handle the error
                    const errorText = await response.text(); 
                    throw new Error(`Error ${response.status}: ${errorText}`);
            }
            const responseBody = await response.json();
            const username = responseBody["username"];
            return username;
        } catch (error) {
            alert(error);
        }
    };

    useEffect(() => {
        console.log('useEffect triggered');
        const fetchData = async () => {
            try {
                await get_user_data();
                // await get_friends_data();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData(); 
    }, []);

    useEffect(() => {
        const fetchFriendsInfo = async () => {
            const info = await Promise.all(
                yourFriends.map(async friend => {
                    // Simulate an async operation to get user info
                    const friendInfo = await get_user_info(friend);
                    return { friend, friendInfo };
                })
            );
            setFriendsInfo(info);
        };

        fetchFriendsInfo();
    }, [yourFriends]);
    
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:text-white bg-white dark:bg-gray-900">
                <div className="flex w-full h-screen flex-col items-center">
                    <h1 className="text-4xl font-bold p-5 dark:text-white">Friends</h1>
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
                        {/* search user */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <div className="flex m-2 p-1 w-full items-center justify-center">
                            <input placeholder="Search users" value={searchTerm}
                            onChange={handleInputChange}
                            className="flex active:border dark:text-white rounded-3xl border dark:bg-slate-700 border-secondary-border shadow-inner shadow-secondary dark:shadow-black py-1 px-3 text-lg focus:border-blue-500 outline-none"/>
                            <Button type="submit"  variant="ghost" className="ml-1 w-9 h-9 flex rounded-full items-center justify-center">
                                <Search />
                            </Button>
                        </div>
                        </form>
                        {/* searched users */}
                        {showResults && (
                        searchresults.map(userr => (
                        <div className="flex w-full items-center justify-center flex-col max-h-32 overflow-y-auto">
                            <div className="flex my-1 rounded-xl border p-1 w-1/4 justify-between">
                                <p className="ml-1">{userr.username}</p>
                                <button onClick={() => add_friend(userr.username)}>
                                <UserPlus className="mx-2" />
                                </button>
                            </div>
                        </div> 
                        ))
            
                        )}
                            <div className="flex w-full items-center flex-col">
                                <h2 className="mb-2">Your friends:</h2>
                                {friendsInfo.map(({ friend, friendInfo }) => (
                                    <div key={friend} className="rounded-xl border justify-between p-2 flex w-1/2">
                                        {friendInfo}
                                        <div className="flex flex-row">
                                            <UserMinus className="mx-3" />
                                            <ContactRound className="mr-1" />
                                        </div>
                                </div>
                            ))}
                            {/* <div className="rounded-xl border justify-between p-2 flex w-1/2">
                                Bartek nowak
                                <div className="flex flex-row">
                                <UserMinus className="mx-3" />
                                <ContactRound className="mr-1" />
                                </div>
                            </div> */}
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
export default FriendsPage;