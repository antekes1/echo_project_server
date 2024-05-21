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
    
const StoragePage = () => {
    const { id } = useParams();
    const [colorMode, setColorMode] = useColorMode();
    const files = [{"type": "file", "name": "hej"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}]
    const [open1, setOpen1] = useState(false)
    const [open2, setOpen2] = useState(false)
    const [open3, setOpen3] = useState(false)
    const handleLargeButtonClick = () => {
        console.log('Large button clicked');
    };
    
    const handleSmallButtonClick = (event) => {
        event.stopPropagation();
        console.log('Small button clicked');
    };

    const handleDelButtonClick = (event) => {
        event.stopPropagation();
        setOpen1(true);
    };

    const handleNewButtonClick = (event) => {
        event.stopPropagation();
        setOpen2(true);
    };

    const handleNewDirButtonClick = (event) => {
        event.stopPropagation();
        setOpen2(false);
        setOpen3(true);
    };
    
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto h-screen">
            <Sidebar />
            <div className="w-full flex-col flex h-screen dark:bg-gray-900 bg-white dark:text-white p-2">
                <div className="flex w-full justify-center items-center">
                    <div className="flex w-2/4 lg:w-1/3 p-4 justify-center items-center rounded-3xl border dark:border-white border-black mr-2">
                        <div className="flex w-1/2 items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full"/>
                        </div>
                        <div className="flex flex-col w-1/2 items-center">
                            <h1>Test storage</h1>
                            <p>0.00 of 25GB</p>
                        </div>
                    </div>
                    <div className="flex rounded-3xl border dark:border-white border-black items-center justify-center h-1/2 w-20">
                        <a href={`/storage_settings/${id}`}>
                            <Settings/>
                        </a>
                    </div>
                </div>
                <div className="flex flex-col items-center m-4">
                    <div className="flex flex-row w-full items-center justify-center">
                        <div className="flex rounded-full border dark:border-white border-black mr-4">
                            <Button size="icon" variant="ghost">
                                <ArrowLeft />
                            </Button>
                        </div>
                        <div className="rounded-3xl border border-violet-500 w-3/4 py-2 px-4">
                            path: /
                        </div>
                    </div>
                    <div className="flex w-full justify-end m-2 mt-4">
                        <Button onClick={handleNewButtonClick} variant="default" className="bg-violet-500 w-24 justify-center items-center flex hover:bg-violet-400">
                            <Plus className="mr-2"/>
                            New
                        </Button>
                    </div>
                    <div className="flex mt-2 w-full rounded-xl flex-col justify-center border border-black dark:border-white p-2 mr-10 ml-10">
                        {files.map(category => (
                            <div className="flex flex-col">
                                <Button variant="transparent" className="flex w-full flex-row p-2 justify-between h-15 relative" onClick={handleLargeButtonClick}>
                                    <div className="flex items-center">
                                    {category.type === "file" ? <File className="mr-4 h-7 w-6"/> : <Folder className="mr-4 h-7 w-6"/>}
                                    <h1>{category.name}</h1>
                                    </div>
                                    <div className="items-center">
                                        {category.type === "file"? 
                                        <Button variant="ghost" className="p-1 mr-2">
                                            <Download className="h-5 w-5" />
                                        </Button> 
                                        : undefined}
                                        <Button variant="ghost" className='p-1 mr-2' onClick={handleDelButtonClick}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>

                                        {/* modals */}
                                        <Modal open={open1} onClose={() => setOpen1(false)}>
                                            <div className="text-center w-56">
                                                <Trash2 className="mx-auto text-red-500" />
                                                <div className="mx-auto my-4 w-48">
                                                <h3 className="text-lg font-black text-gray-800 dark:text-white">Confirm to Continue</h3>
                                                <p className="text-sm text-gray-500">Are you sure to Continue</p>
                                                </div>
                                                <div className="flex gap-4">
                                                <Button className="w-full">Continue</Button>
                                                <Button onClick={() => setOpen1(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                                </div>
                                            </div>
                                        </Modal>
                                        <Modal open={open2} onClose={() => setOpen2(false)}>
                                            <div className="text-center w-56">
                                                <div className="mx-auto my-4 w-48">
                                                    <h3 className="text-lg font-black text-gray-800 dark:text-white">New</h3>
                                                    <p className="text-sm text-gray-500">What do you want to do ?</p>
                                                </div>
                                                <div className="flex justify-center flex-row p-2">
                                                    <div className="flex items-center flex-col m-2">
                                                        <Button size="icon" className="mb-1">
                                                            <Upload />
                                                        </Button>
                                                        <h1>Upload file</h1>
                                                    </div>
                                                    <div className="flex items-center flex-col m-2">
                                                        <Button onClick={handleNewDirButtonClick} size="icon" className="mb-1">
                                                            <FolderPlus />
                                                        </Button>
                                                        <h1>Create dir</h1>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <Button onClick={() => setOpen2(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                                </div>
                                            </div>
                                        </Modal>
                                        <Modal open={open3} onClose={() => setOpen3(false)}>
                                            <div className="text-center w-56">
                                                <div className="mx-auto my-4 w-48">
                                                    <h3 className="text-lg font-black text-gray-800 dark:text-white">New dir</h3>
                                                    <p className="text-sm text-gray-500">Enter name for new dir</p>
                                                </div>
                                                <div className="flex justify-center flex-row p-2">
                                                    <input 
                                                    className="flex rounded-3xl p-2 dark:bg-gray-800 border border-violet-500 dark:hover:border-gray-900"
                                                    placeholder="new dir name"
                                                    />
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <Button className="btn btn-light w-full">Create</Button>
                                                    <Button onClick={() => setOpen3(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                                                </div>
                                            </div>
                                        </Modal>
                                    </div>
                                </Button>
                                <hr className="border-t border-black dark:border-white" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
    // <div>
    //   <h1>Storage Page</h1>
    //   <p>ID from URL: {id}</p>
    // </div>}
}
export default StoragePage;