import { ReactNode, createContext, useContext, useState } from "react"

type SidebarProviderProps = {
    children: ReactNode
}

type SidebarContextType = {
    isLargeOpen: boolean
    isSmallOpen: boolean
    toogle: () => void
    close(): void
}

const SidebarContext = createContext<SidebarContextType | null> (null)

export function useSidebarContext() {
    const value = useContext(SidebarContext)
    if (value == null) throw Error("Cannot use outside of SidebarProvidor")
    return value
}

export function SidebarProvider({children}: SidebarProviderProps) {
    const [isLargeOpen, setIsLargeOpen]= useState(true)
    const [isSmallOpen, setIsSmallOpen]= useState(false)

    function isScreenSmall() {
        return window.innerWidth < 1024
    }
    function toogle() {
        if (isScreenSmall()) {
            setIsSmallOpen(s => !s)
        } else {
            setIsLargeOpen (l => !l)
        }
    }
    function close() {
        if (isScreenSmall()) {
            setIsSmallOpen(false)
        } else {
            setIsLargeOpen (false)
        }
    }

    return( 
    <SidebarContext.Provider value={{isLargeOpen, isSmallOpen, toogle, close}}>
        {children}
    </SidebarContext.Provider>
    )
}