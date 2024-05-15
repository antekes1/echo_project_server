import { useEffect, useRef, useState } from "react"
import { Button } from "./Button"
import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CategoryPillProps = {
    categories: string[]
    selectedCategory: string
    onSelect: (category: string) => void
}
  
const TRANSLATE_AMOUNT = 200

export function CategoryPills({
    categories, selectedCategory, onSelect,
}: CategoryPillProps) {
    const [translate, setTransalte] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLeftVisable, setLeftVisable] = useState(false);
  const [isRightVisable, setRightVisable] = useState(false);

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
    <div className="overflow-x-hidden relative" ref={containerRef}>
            <div className="flex whitespace-nowrap gap-3 transition-transform w-[max-content]" style={{transform: `translateX(-${translate}px)`}}>
              {categories.map(category => (
                <Button onClick={() => onSelect(category)} key={category} variant={selectedCategory === category ? "dark" : "default"} className="py-1 px-3 rounded-lg whitespace-nowrap">{category}</Button>
              ))}
            </div>
            {isLeftVisable && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-white from-50% to-transparent w-24 h-full">
              <Button variant="ghost" size="icon" className="h-full aspect-square w-auto p-1.5" onClick={() => {
                setTransalte(translate => {
                  const newTranslate = translate - TRANSLATE_AMOUNT 
                  if (newTranslate <= 0) return 0
                  return newTranslate
                })
              }}>
              <ChevronLeft />
              </Button>
            </div>
            )}
            {isRightVisable && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white from-50% to-transparent w-24 h-full flex justify-end">
              <Button variant="ghost" size="icon" className="h-full aspect-square w-auto p-1.5" onClick={() => {
                  setTransalte(translate => {
                  if (containerRef.current == null) {return translate}
                  const newTranslate = translate + TRANSLATE_AMOUNT
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
  );
}