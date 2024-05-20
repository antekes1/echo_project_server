import { useParams } from 'react-router-dom';
import user from "../../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import {  } from 'lucide-react';
import { Sidebar } from '../../layouts/Sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from "../../hooks/useColorMode.jsx"
    
const StoragePage = () => {
    const { id } = useParams();
    const [colorMode, setColorMode] = useColorMode();
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen dark:bg-gray-900 bg-white dark:text-white">
                hej
            </div>
        </div>
    );
    // <div>
    //   <h1>Storage Page</h1>
    //   <p>ID from URL: {id}</p>
    // </div>}
}
export default StoragePage;