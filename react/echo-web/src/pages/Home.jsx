import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '../layouts/Sidebar';
import { useSidebarContext } from '../contexts/SidebarContext';

const TRANSATE_AMOUNT = 200

const Home = () => {
  const categories = ["test storage", "my_sotraaddge", "my_sdadtrage", "my_sotfrage", "my_sotdarage", "my_swqotrage", "myffe_sotrage", "my_sotfaswrage", "my_sotragdafe", "my_s74hndotrage", "my_sotrai4ms8ge"];
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [translate, setTransalte] = useState(0)
  const containerRef = useRef(null);
  const [isLeftVisable, setLeftVisable] = useState(false);
  const [isRightVisable, setRightVisable] = useState(false);
  const {toogle} = useSidebarContext()

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
    <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
      <Sidebar/>
      <div className="overflow-x-hidden px-8 pb-4">
        <div className="sticky top-0 bg-white z-1- pb-4 ">
          <div className="overflow-x-hidden relative" ref={containerRef}>
            <div className="flex whitespace-nowrap gap-3 transition-transform w-[max-content]" style={{transform: `translateX(-${translate}px)`}}>
              {categories.map(category => (
                <Button onClick={() => setSelectedCategory(category)} key={category} variant={selectedCategory === category ? "ghost" : "transparent"} className="py-1 px-3 rounded-lg whitespace-nowrap text-white">
                  <div className="w-52 h-36 justify-center flex items-center bg-blue-600">
                    {category}
                  </div>
                </Button>
              ))}
            </div>
            {isLeftVisable && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-white from-50% to-transparent w-12 h-full">
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
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white from-50% to-transparent w-12 h-full flex justify-end">
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
        </div>
      </div>
    </div>
  );
};

export default Home;