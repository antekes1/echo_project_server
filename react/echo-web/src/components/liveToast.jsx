import { XIcon } from 'lucide-react';
export default function Toast({ title, body, setShowToast, icon }) {
    return (
    <div className="fixed bottom-0 right-0 m-5 p-3 w-96 bg-gray-300 dark:bg-gray-600 dark:text-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {/* <img
                    src="https://via.placeholder.com/20"
                    alt="logo"
                    className="rounded mr-2"
                /> */}
                <strong className="me-auto">{title}</strong>
                </div>
                {/* <small className="text-gray-500">11 mins ago</small> */}
                <button
                className="text-gray-500 hover:text-gray-700 ml-4"
                onClick={() => setShowToast(false)}
                aria-label="Close"
                >
                <XIcon className="flex text-red-400" />
                </button>
        </div>
        <div className="toast-body py-3">
            {body}
        </div>
    </div>
)}