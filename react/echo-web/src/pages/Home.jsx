import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../hooks/useColorMode.jsx'
import SERVER_URL from "../settings.jsx";

const TRANSATE_AMOUNT = 200

const Home = () => {
  const [colorMode, setColorMode] = useColorMode();
  const [categories, setCategories] = useState([]);
  //const categories = ["test storage", "my_sotraaddge", "my_sdadtrage", "my_sotfrage", "my_sotdarage", "my_swqotrage", "myffe_sotrage", "my_sotfaswrage", "my_sotragdafe", "my_s74hndotrage", "my_sotrai4ms8ge"];
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [translate, setTransalte] = useState(0)
  const containerRef = useRef(null);
  const [isLeftVisable, setLeftVisable] = useState(false);
  const [isRightVisable, setRightVisable] = useState(false);
  const {toogle} = useSidebarContext()
  const navigate = useNavigate();

  const handletest = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log(token);
  }

  const storageButton = async (category) => {
    setSelectedCategory(category[0]);
    navigate(`/storage/${category[0]}`)
  }

  const get_storage_data = async () => {
    const token = localStorage.getItem("token");
    try {        
        const response = await fetch(`${SERVER_URL}storage/${token}`, {
          method: 'GET',
        })

        if (!response.ok) {
            // Response is not OK, handle the error
            const errorText = await response.text(); 
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        const responseBody = await response.json();
        if (responseBody.hasOwnProperty('storages')) {
          setCategories(responseBody.storages)
        }
      } catch (error) {
        alert(error);
    }
  };
  

  useEffect(() => {
    console.log('useEffect triggered');
    get_storage_data();
  }, []);

  useEffect(() => {
    if (containerRef.current == null) return

    const observer = new ResizeObserver(entries => {
      const container = entries[0]?.target
      if (container == null) return
      setLeftVisable(translate > 0)
      setRightVisable(translate + container.clientWidth < container.scrollWidth)
    })
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect
    }
  }, [categories, translate])

  return (
    <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto h-screen">
      <Sidebar/>
      <div className="overflow-x-hidden px-8 pb-4 dark:bg-gray-900">
        <div className="sticky top-0 dark:text-white bg-white dark:bg-gray-900 z-1- pb-4 ">
          <div className="overflow-x-hidden relative" ref={containerRef}>
            <div className="flex whitespace-nowrap gap-3 transition-transform w-[max-content]" style={{transform: `translateX(-${translate}px)`}}>
              {categories.map(category => (
                <Button onClick={() => storageButton(category)} key={category[0]} variant={selectedCategory === category[0] ? "ghost" : "transparent"} className="py-1 px-3 rounded-lg whitespace-nowrap text-white">
                  <div className="w-52 h-36 justify-center flex items-center bg-blue-600">
                    {category[1]}
                  </div>
                </Button>
              ))}
            </div>
            {isLeftVisable && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-white dark:from-gray-900 from-50% to-transparent w-12 h-full dark:text-white">
              <Button variant="transparent" size="icon" className="h-full aspect-square w-auto p-1.5 flex justify-start" onClick={() => {
                setTransalte(translate => {
                  const newTranslate = translate - TRANSATE_AMOUNT
                  if (newTranslate <= 0) return 0
                  return newTranslate
                })
              }}>
              <ChevronLeft />
              </Button>
            </div>
            )}
            {isRightVisable && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-900 from-50% to-transparent w-12 h-full flex justify-end dark:text-white">
              <Button variant="transparent" size="icon" className="h-full aspect-square w-auto p-1.5 flex justify-end" onClick={() => {
                  setTransalte(translate => {
                  if (containerRef.current == null) {return translate}
                  const newTranslate = translate + TRANSATE_AMOUNT
                  const edge = containerRef.current.scrollWidth
                  const width = containerRef.current.clientWidth
                  if (newTranslate + width >= edge) {
                    return edge - width
                  }
                  return newTranslate
                  })
              }}>
              <ChevronRight />
              </Button>
            </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <Button onClick={handletest}>
              heja to tylko test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;