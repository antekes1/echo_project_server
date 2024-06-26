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
import SERVER_URL from '../../settings.jsx';
    
const StoragePage = () => {
    const { id } = useParams();
    const [colorMode, setColorMode] = useColorMode();
    const [files, setFiles] = useState([]);
    const [newDir, setNewDri] = useState("");
    const [open1, setOpen1] = useState(false)
    const [open2, setOpen2] = useState(false)
    const [open3, setOpen3] = useState(false)
    const [path, setPath] = useState("/");
    const token = localStorage.getItem('token');
    const [storageInfo, setStorageInfo] = useState({});
    const fileInputRef = useRef(null);
    const deleteItem = async (type, name) => {
        try {
            const data = {
                token: token,
                storage_id: id,
                path: type === "file" ? path + name : path + name + "/"
            };
            const response = await fetch(`${SERVER_URL}storage/del_item`, {
                method: 'DELETE',
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
            get_files();
            setOpen1(false)
        } catch (error) {
            alert(error);
        };
    };
    const createNewDir = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
                path: path+newDir+"/",
            };
            const response = await fetch(`${SERVER_URL}storage/create_dir`, {
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
            get_files();
            setOpen3(false)
        } catch (error) {
            alert(error);
        };
    };
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
        } catch (error) {
            alert(error);
        };
    };
    const get_files = async () => {
        try {
            const data = {
                token: token,
                storage_id: id,
                path: path,
            };
            const response = await fetch(`${SERVER_URL}storage/files`, {
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
            setFiles(responseBody);
        } catch (error) {
            alert(error);
        };
    };
    const getFileFromServer = async (event, name) => {
        event.stopPropagation();
        try {
            const data = {
                token: token, // Przykładowe dane do przekazania
                database_id: id,
                file_path: path+name,
                filename: name,
            };
            console.log(data)
            const response = await fetch(`${SERVER_URL}storage/get_file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to get file from server');
            }
            
            // Jeśli odpowiedź jest OK, pobierz treść pliku
            const blob = await response.blob();
            
            // Utwórz link do pobrania pliku
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            
            link.click();
            
            link.parentNode.removeChild(link);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('dir_path', path); // Aktualna ścieżka
        formData.append('database_id', id);
        formData.append('file', file);

        try {
            const response = await fetch(`${SERVER_URL}storage/upload_file`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                alert('File upload successful');
                get_files(); // Odśwież listę plików po przesłaniu
                setOpen2(false)
            } else {
                const errorData = await response.json();
                console.error(errorData);
                alert('File upload failed: ' + errorData.detail);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };
    useEffect(() => {
        get_storage_info();
        console.log('useEffect triggered');
    }, []);

    useEffect(() => {
        get_files(path);
    }, [path]);

    const handleLargeButtonClick = (type, name) => {
        if (type === "file") {
            console.log('Large button clicked');
        } else {
            setPath(prevPath => prevPath + name + "/");
        }
    };
    
    const handleSmallButtonClick = (event) => {
        event.stopPropagation();
        console.log('Small button clicked');
    };

    const [confirmData, setConfirmData] = useState({ type: "", name: "" });

    const handleDelButtonClick = (event, type, name) => {
        event.stopPropagation();
        setConfirmData({ type, name });
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

    const goBackOneFolder = (path) => {
        if (typeof path !== 'string') return path;
        let pathParts = path.split('/');
        while (pathParts.length > 0 && pathParts[pathParts.length - 1] === "") {
            pathParts.pop();
        }
        if (pathParts.length > 0) {
            pathParts.pop();
        }
        let newPath = pathParts.join('/');
        if (!newPath.endsWith('/')) {
            newPath += '/';
        }
        setPath(newPath);
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
                            <h1>{storageInfo.name}</h1>
                            <p>{(storageInfo.actual_size / 1073741824).toFixed(4)}GB of {storageInfo.max_size}GB</p>
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
                            <Button onClick={() => {goBackOneFolder(path)}} size="icon" variant="ghost">
                                <ArrowLeft />
                            </Button>
                        </div>
                        <div className="rounded-3xl border border-violet-500 w-3/4 py-2 px-4">
                            path: {path}
                        </div>
                    </div>
                    <div className="flex w-full justify-end m-2 mt-4">
                        <Button onClick={handleNewButtonClick} variant="default" className="bg-violet-500 w-24 justify-center items-center flex hover:bg-violet-400">
                            <Plus className="mr-2"/>
                            New
                        </Button>
                    </div>
                    <div className="flex mt-2 w-full rounded-xl flex-col justify-center border border-black dark:border-white p-2 mr-10 ml-10">
                        {Object.keys(storageInfo).length === 0 ?
                        <h1>Please log in your account with permission to this storage or ask owner for permission</h1>
                        : files.map(category => (
                            <div className="flex flex-col" key={category[0] + category[1]}>
                                <Button variant="transparent" className="flex w-full flex-row p-2 justify-between h-15 relative" onClick={() => handleLargeButtonClick(category[1], category[0])}>
                                    <div className="flex items-center">
                                    {category[1] === "file" ? <File className="mr-4 h-7 w-6"/> : <Folder className="mr-4 h-7 w-6"/>}
                                    <h1>{category[0]}</h1>
                                    </div>
                                    <div className="items-center">
                                        {category[1] === "file"? 
                                        <Button variant="ghost" onClick={(event) => getFileFromServer(event, category[0])} className="p-1 mr-2">
                                            <Download className="h-5 w-5" />
                                        </Button> 
                                        : undefined}
                                        <Button variant="ghost" className='p-1 mr-2' onClick={(event) => handleDelButtonClick(event, category[1], category[0])}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                        
                                    </div>
                                </Button>
                                <hr className="border-t border-black dark:border-white" />
                            </div>
                        ))}
                        <Modal open={open1} onClose={() => setOpen1(false)}>
                        <div className="text-center w-56">
                            <Trash2 className="mx-auto text-red-500" />
                            <div className="mx-auto my-4 w-48">
                                <h3 className="text-lg font-black text-gray-800 dark:text-white">Confirm to Continue</h3>
                                <p className="text-sm text-gray-500">Are you sure to Continue</p>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={() => deleteItem(confirmData.type, confirmData.name)} className="w-full">Continue</Button>
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
                                                        <Button onClick={handleButtonClick} size="icon" className="mb-1">
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
                            onChange={(e) => setNewDri(e.target.value)}
                            className="flex rounded-3xl p-2 dark:bg-gray-800 border border-violet-500 dark:hover:border-gray-900"
                            placeholder="new dir name"
                            />
                            </div>
                        <div className="flex gap-4 mt-2">
                            <Button onClick={createNewDir} className="btn btn-light w-full">Create</Button>
                            <Button onClick={() => setOpen3(false)} className="btn btn-light w-full" variant="ghost">Cancel</Button>
                        </div>
                        </div>
                        </Modal>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
    // <div>
    //   <h1>Storage Page</h1>
    //   <p>ID from URL: {id}</p>
    // </div>}
}
export default StoragePage;