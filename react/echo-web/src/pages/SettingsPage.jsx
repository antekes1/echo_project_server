import user from "../assets/images/user.png"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import {  } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const [updateData, setupdateData] = useState(false);
    return (
        <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
            <Sidebar/>
            <div className="w-full flex h-screen">
                <div className="flex w-full h-screen">
                    <h1>Settings</h1>
                </div>
            </div>
        </div>
    );
}
export default SettingsPage;