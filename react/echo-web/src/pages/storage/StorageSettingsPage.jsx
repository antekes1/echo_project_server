import { Navigate, useParams } from 'react-router-dom';
import user from "../../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Settings, ArrowLeft, File, Folder, Download, Trash2, Plus, Upload, FolderPlus, Check } from 'lucide-react';
import { Sidebar } from '../../layouts/Sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../../hooks/useColorMode.jsx"
import Modal from "../../components/Modal.jsx"
import SERVER_URL from '../../settings.jsx';
import Toast from "../../components/liveToast.jsx";
    
const StorageSettingsPage = () => {
    const { id } = useParams();
    const [showTost, setShowTost] = useState(false);
    const [toastContent, setToastContent] = useState({ title: "", body: ""});
    const [colorMode, setColorMode] = useColorMode();
    const [current_users, setCurrentUsers] = useState([]);
    const [name, setname] = useState('');
    const [descr, setDescr] = useState('');
    const [newuser, setNewUser] = useState("");
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [storageInfo, setStorageInfo] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const handleSmallButtonClick = (event) => {
        event.stopPropagation();
        setOpen1(true);
    };
    const del_storagehandle_click = (event) => {
        event.stopPropagation();
        setOpen2(true);
    };
    const handleShowToast = (title, body, icon = null) => {
        setToastContent({ title, body, icon });
        setShowTost(true);
        setTimeout(() => {
          setShowTost(false);
        }, 7000);
    };
    const update_storage_info = async () => {
        try{
            const data = {
                token: token,
                storage_id: id,
                name: name,
                descr: descr
            };
            const response = await fetch(`${SERVER_URL}storage/update`, {
                method: 'PUT',
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
            handleShowToast("", responseBody.msg);
            alert(responseBody.msg);
            get_storage_info();
        } catch (error) {
            alert(error);
        };
    }
    const get_current_users = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
                action: "get_current_users",
                updated_users_usernames: [],
            };
            const response = await fetch(`${SERVER_URL}storage/users`, {
                method: 'PUT',
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
            setCurrentUsers(responseBody.current_users);
        } catch (error) {
            alert(error);
        };
    }
    const add_new_user = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
                action: "add_users",
                updated_users_usernames: [newuser],
            };
            const response = await fetch(`${SERVER_URL}storage/users`, {
                method: 'PUT',
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
            handleShowToast("success", responseBody.msg);
            get_current_users();
        } catch (error) {
            alert(error);
        };
    }
    const get_storage_info = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
            };
            const response = await fetch(`${SERVER_URL}storage/info`, {
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
            setStorageInfo(responseBody);
            setname(responseBody.name);
            setDescr(responseBody.description)
            get_current_users();
        } catch (error) {
            alert(error);
            navigate("/");
        };
    };
    const del_storage_user = async (username) => {
        try {
            const data = {
                token: token,
                storage_id: id,
                action: "remove_users",
                updated_users_usernames: [username],
            };
            const response = await fetch(`${SERVER_URL}storage/users`, {
                method: 'PUT',
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
            if(responseBody["msg"] === "succes") {
                handleShowToast("success", "User removed suucefullly", <Check className="text-green-600" />);
            } else {
                handleShowToast("", responseBody.msg);
            }
            get_current_users();
            setOpen1(false);
        } catch (error) {
            alert(error);
        };
    }
    const del_storage = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
            };
            const response = await fetch(`${SERVER_URL}storage/delete_storage`, {
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
            navigate("/");
            handleShowToast("message: ", responseBody.msg);
        } catch (error) {
            alert(error);
        };
    }
    useEffect(() => {
        get_storage_info();
        console.log('useEffect triggered');
    }, []);
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto h-screen">
            <Sidebar />
            <div className="w-full flex-col flex h-screen dark:bg-gray-900 bg-white dark:text-white p-2">
                <div className="flex w-full justify-center items-center">
                    <div className="flex w-2/4 lg:w-1/3 p-4 justify-center rounded-3xl border dark:border-white border-black mr-2">
                        <div className="flex w-1/2 items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full"/>
                        </div>
                        <div className="flex flex-col w-1/2 items-center">
                            <h1>{storageInfo.name}</h1>
                            <p>{(storageInfo.actual_size / 1073741824).toFixed(4)}GB of {storageInfo.max_size}GB</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center m-4">
                    <h1 className="text-3xl font-bold mb-3">Storage settings</h1>
                    <div className="flex mt-2 w-full rounded-xl flex-col justify-center p-2 mr-10 ml-10">
                        <div className="p-2 felx-col items-center w-full mb-2">
                            <h1 className="felx text-lg mb-2">Change data: </h1>
                            <div className="flex flex-col justify-center">
                                <div className="flex flex-col mb-2" key={"name"}>
                                    <label className="font-bold mb-2">Storage name</label>
                                    <input 
                                    placeholder="name"
                                    id='name' 
                                    name="name"
                                    type="name"
                                    className="w-2/3 border-2 rounded-2xl p-2 ml-1 hover:border-violet-500 dark:bg-slate-600 bg-white"
                                    value={name}
                                    onChange={(e) => setname(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col mb-2" key={"descr"}>
                                    <label className="font-bold mb-2">Storage description</label>
                                    <input 
                                    placeholder="description"
                                    id='description' 
                                    name="description"
                                    type="description"
                                    className="w-2/3 border-2 rounded-2xl p-2 ml-1 hover:border-violet-500 dark:bg-slate-600 bg-white"
                                    value={descr}
                                    onChange={(e) => setDescr(e.target.value)}
                                    />
                                </div>
                                <Button onClick={update_storage_info} className="w-1/4 rounded-xl my-2">
                                    Update
                                </Button>
                            </div>
                        </div>
                        <div className="p-2 felx-col w-full mb-2 justify-center">
                            <div className="flex justify-center mb-2">
                                <h1 className="text-xl">Manage acess to storage</h1>
                            </div>
                            <div className="flex justify-center flex-row w-full p-2 mb-2">
                                <input
                                placeholder="username"
                                className="mr-8 w-1/2 rounded-xl dark:bg-slate-600 border-2 border-black dark:border-violet-900 p-1"
                                value={newuser}
                                onChange={(e) => setNewUser(e.target.value)}
                                />
                                <Button onClick={add_new_user} className="w-16" size="icon">
                                    <Plus /> Add
                                </Button>
                            </div>
                            <div className="dark:bg-gray-800 rounded-2xl py-2 px-3 flex flex-col">
                                {current_users.map(user => (
                                    <div className="flex p-2 rounded-xl border flex-row justify-between w-full mb-2">
                                        {user}
                                        <div className="mr-2">
                                            <Button onClick={handleSmallButtonClick} size="icon" variant="transparent" className="p-1 h-6 w-8">
                                                <Trash2 />
                                            </Button>
                                            <Modal open={open1} onClose={() => setOpen1(false)}>
                                                <div className="text-center w-56">
                                                    <Trash2 className="mx-auto text-red-500" />
                                                    <div className="mx-auto my-4 w-48">
                                                    <h3 className="text-lg font-black text-gray-800 dark:text-white">Confirm to Continue</h3>
                                                    <p className="text-sm text-gray-500">Are you sure to Continue</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                    <Button onClick={() => {del_storage_user(user)}} className="w-full">Continue</Button>
                                                    <Button onClick={() => setOpen1(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </div>
                                    </div>  
                                ))}
                            </div>
                            <Modal open={open2} onClose={() => setOpen2(false)}>
                            <div className="text-center w-56">
                                <Trash2 className="mx-auto text-red-500" />
                                <div className="mx-auto my-4 w-48">
                                    <h3 className="text-lg font-black text-gray-800 dark:text-white">Confirm to Continue</h3>
                                    <p className="text-sm text-gray-500">Are you sure to Continue</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={() => {del_storage()}} className="w-full">Continue</Button>
                                    <Button onClick={() => setOpen2(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                </div>
                            </div>
                            </Modal>
                        </div>
                        <div className="flex p-2 felx-col w-full mb-2 justify-center">
                            <Button onClick={del_storagehandle_click} className="rounded-lg w-1/4">
                                Delete this storage
                            </Button>
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
    );
}
export default StorageSettingsPage;