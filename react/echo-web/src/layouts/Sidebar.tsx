import { Home, UserCircle, Settings, ChevronDown, ChevronUp, HardDrive, Menu } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { ElementType } from "react";
import { Button, buttonStyles } from "../components/Button";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "../contexts/SidebarContext";
import { NavbarFirstSection } from "./Navbar";

export function Sidebar() {
    const {toogle, isLargeOpen, isSmallOpen} = useSidebarContext()
    const example_storages = [{id: "1", name: "Storage1"}, {id: "2", name: "Storage2"},{id: "3", name: "Storage3"},{id: "4", name: "Storage4"},]
    return (
        <>
        <aside className={`sticky top-0 overflow-y-auto scrollbar-hidden pb-4 flex flex-col ml-1 ${isLargeOpen ? "lg:hidden": "lg:flex"}`}>
            <SmallSidebarItem Icon={Home} title="Home" url="/" />
            <SmallSidebarItem Icon={UserCircle} title="Profile Page" url="/profile" />
            <SmallSidebarItem Icon={Settings} title="Settings Page" url="/settings" />
        </aside>
        {isSmallOpen && (
            <div onClick={close} className="lg:hidden fixed inset-0 z-[999] opacity-50"/>
        )}
        <aside className={`w-56 lg:sticky absolute top-0 overflow-y-auto scrollbar-hidden pb-4 flex-col gap-2 px-2 lg:flex ${isLargeOpen ? "lg:flex":"lg:hidden"} ${isSmallOpen ? "flex z-[999] bg-white max-h-screen": "hidden"}`}>
            <div className="lg:hidden pt-2 pb-4 px-2 sticky top-0 bg-white">
                <NavbarFirstSection hidden={false}/>
            </div>
            <LargeSidebarSection >
                
                <LargeSiderbarItem Icon={Home} title="Home" url="/" />
                <LargeSiderbarItem Icon={UserCircle} title="Profile Page" url="/profile" />
                <LargeSiderbarItem Icon={Settings} title="Settings Page" url="/settings" />
            </LargeSidebarSection>
            <hr/>
            <LargeSidebarSection title="Storages" visableItemCount={5}>
                {example_storages.map(example_storages =>(
                    <LargeSiderbarItem key={example_storages.id} Icon={HardDrive} title={example_storages.name} url={`/storage?id=${example_storages.id}`} />
                ))}
            </LargeSidebarSection>
        </aside>
        </>
    )
}

type SmallSidebarItemProps = {
    Icon: ElementType,
    title: string,
    url: string,
}

function SmallSidebarItem({Icon, title, url}: SmallSidebarItemProps) {
    return <a href={url} className={twMerge(buttonStyles({variant: "ghost"}), "py-4 px-1 flex flex-col items-center rounded-lg gap-1")}>
        <Icon className="w-6 h-6" />
        <div className="text-sm">{title}</div>
    </a>
}

type LargeSidebarSectionProps = {
    children: ReactNode,
    title?: string,
    visableItemCount?: number,
}

function LargeSidebarSection({children, title, visableItemCount = Number.POSITIVE_INFINITY}: LargeSidebarSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const childrenArray = React.Children.toArray(children).flat()
    const visableChildren = isExpanded ? children : childrenArray.slice(0, visableItemCount)
    const showExpandedButton = childrenArray.length > visableItemCount
    const ButtonIcon = isExpanded ? ChevronUp : ChevronDown
    return ( 
        <div>
            {title && <div className="ml-4 mt-2 text-lg mb-1">{title}</div>}
            {visableChildren}
            {showExpandedButton &&
                <Button onClick={() => setIsExpanded(e => !e)} variant="ghost" className="w-full flex items-center rounded-lg gap-4 p-3">
                    <ButtonIcon className="h-6 w-6" />
                    <div>{isExpanded ? "Show less" : "Show more"}</div>
                </Button>
            }
        </div>
    )
}

type LargeSidebarItemProps = {
    Icon: ElementType,
    title: string,
    url: string,
    isActive?: boolean,
}

function LargeSiderbarItem({Icon, title, url, isActive=false}: LargeSidebarItemProps) {
    if (url === window.location.pathname) {
        isActive=true;
    }
    return <a href={url} className={twMerge(buttonStyles({variant: "ghost"}), `w-full flex items-center rounded-lg gap-4 p-3 ${isActive ? "font-bold bg-neutral-100 hover:bg-secondary" : undefined}`)}>
        <Icon className="w-6 h-6" />
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
        </div>
    </a>
}