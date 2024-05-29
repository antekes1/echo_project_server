import { Navigate, useParams } from 'react-router-dom';
import user from "../../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Settings, ArrowLeft, File, Folder, Download, Trash2, Plus, Upload, FolderPlus } from 'lucide-react';
import { Sidebar } from '../../layouts/Sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../../hooks/useColorMode.jsx"
import Modal from "../../components/Modal.jsx"
import SERVER_URL from '../../settings.jsx';
    
const CreateStoragePage = () => {
    const [colorMode, setColorMode] = useColorMode();
    const [userData, setUserData] = useState({});
    const [name, setname] = useState('storage');
    const [size, setSize] = useState(0);
    const [descr, setDescr] = useState('');
    const [newuser, setNewUser] = useState("");
    const [maxsize, serMaxSize] = useState(5);
    const [storageInfo, setStorageInfo] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const handleSmallButtonClick = (event) => {
        event.stopPropagation();
        create_storage();
    };
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
            if (responseBody.account_type === "owner") {
                serMaxSize(2000);
            }
          } catch (error) {
            alert(error);
        }
    };
    const create_storage = async () => {
        try {   
            const data = {
                token: token,
                name: name,
                descr: descr,
                size: size,
            };
    
            const response = await fetch(`${SERVER_URL}storage/create_storage`, {
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
            alert(error);
        }
    };
    useEffect(() => {
        console.log('useEffect triggered');
        get_user_data();
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
                            <h1>{name}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center m-4">
                    <h1 className="text-3xl font-bold mb-3">Create your storage</h1>
                    <div className="flex mt-2 w-full rounded-xl flex-col items-center p-2 mr-10 ml-10">
                        <div className="flex flex-col mb-2 w-2/3 items-center">
                            <label className="font-bold mb-2">Storage name</label>
                            <input
                            key={"name"}
                            placeholder="name"
                            id='name' 
                            name="name"
                            type="name"
                            className="w-2/3 border-2 rounded-2xl p-2 ml-1 hover:border-violet-500 dark:bg-slate-600 bg-white"
                            value={name}
                            onChange={(e) => setname(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col mb-2 w-2/3 items-center">
                            <label className="font-bold mb-2">Storage description</label>
                            <input
                            key={"description"}
                            placeholder="description"
                            id='description' 
                            name="description"
                            type="description"
                            className="w-2/3 border-2 rounded-2xl p-2 ml-1 hover:border-violet-500 dark:bg-slate-600 bg-white"
                            value={descr}
                            onChange={(e) => setDescr(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col mb-2 w-2/3 items-center">
                            <label className="font-bold mb-2">Storage size</label>
                            <div className="flex flex-row mb-2 w-full items-center justify-center">
                            <input
                                type="range"
                                min={1}
                                max={maxsize}
                                step={1}
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            />
                            <input
                            key={"size"}
                            placeholder="size"
                            id='size' 
                            name="size"
                            className="w-1/6 border-2 rounded-2xl p-2 ml-1 hover:border-violet-500 dark:bg-slate-600 bg-white"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            />
                            <h1 className="ml-2">GB</h1>
                            </div>
                        </div>
                        <Button onClick={handleSmallButtonClick} className="rounded-lg m-2">
                            Create storage
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CreateStoragePage;