import { useParams } from 'react-router-dom';
import user from "../../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Settings, ArrowLeft, File, Folder, Download, Trash2, Plus, Upload, FolderPlus } from 'lucide-react';
import { Sidebar } from '../../layouts/Sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../../hooks/useColorMode.jsx"
import Modal from "../../components/Modal.jsx"
    
const StorageSettingsPage = () => {
    const { id } = useParams();
    const [colorMode, setColorMode] = useColorMode();
    const current_users = ["antekes1"]
    const files = [{"type": "file", "name": "hej"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}]
    const [name, setname] = useState('');
    const [descr, setDescr] = useState('');
    const [open1, setOpen1] = useState(false);
    const handleSmallButtonClick = (event) => {
        event.stopPropagation();
        setOpen1(true);
    };
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
                            <h1>Test storage</h1>
                            <p>0.00 of 25GB</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center m-4">
                    <h1 className="text-3xl font-bold mb-3">Storage settings</h1>
                    <div className="flex mt-2 w-full rounded-xl flex-col justify-center p-2 mr-10 ml-10">
                        <div className="p-2 felx-col items-center w-full mb-2">
                            <h1 className="felx text-lg mb-2">Change data: </h1>
                            <div className="flex flex-col justify-center">
                                <div className="flex flex-col mb-2">
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
                                <div className="flex flex-col mb-2">
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
                                <Button className="w-1/4 rounded-xl my-2">
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
                                />
                                <Button className="w-16" size="icon">
                                    <Plus /> Add
                                </Button>
                            </div>
                            <div className="dark:bg-gray-800 rounded-2xl py-2 px-3 flex flex-col">
                                {current_users.map(user => (
                                    <div className="flex p-2 rounded-xl border flex-row justify-between w-full">
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
                                                    <Button onClick={() => {console.log(user)}} className="w-full">Continue</Button>
                                                    <Button onClick={() => setOpen1(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </div>
                                    </div>  
                                ))}
                            </div>
                        </div>
                        <div className="flex p-2 felx-col w-full mb-2 justify-center">
                            <Button className="rounded-lg w-1/4">
                                Delete this storage
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default StorageSettingsPage;