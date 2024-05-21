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
    const files = [{"type": "file", "name": "hej"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}, {"type": "file", "name": "hej2"}, {"type": "folder", "name": "hej3"}]
    
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
                    <div className="flex rounded-3xl border dark:border-white border-black items-center justify-center h-1/2 w-20">
                        <Button size="icon" variant="ghost">
                            <Settings/>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center m-4">
                    <h1 className="text-3xl font-bold mb-3">Storage settings</h1>
                    <div className="flex mt-2 w-full rounded-xl flex-col justify-center border p-2 mr-10 ml-10">
                        hej
                    </div>
                </div>
            </div>
        </div>
    );
}
export default StorageSettingsPage;