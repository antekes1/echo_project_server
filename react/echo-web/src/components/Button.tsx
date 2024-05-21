import {cva, VariantProps} from "class-variance-authority"
import React from "react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export const buttonStyles = cva(["transition-colors"], {
    variants: {
        variant: {
            default: ["bg-secondary", "hover:bg-secondary-hover", "dark:bg-violet-700", "dark:hover:bg-violet-400"],
            ghost: ["hover:bg-gray-100 dark:hover:bg-gray-800"],
            transparent: ["hover:bg-transparent"],
            dark: ["bg-secondary-dark", "hover:bg-secondary-dark-hover", "text-secondary"]
        },
        size: {
            default: ['rounded', 'p-2'],
            icon: ['rounded-full', 'w-10', "h-10", 'flex', "items-center", "justify-center", 'p-2.5',],
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
})

type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">

export function Button({ variant, size, className, ...props }: ButtonProps) {
    return <button {...props} className={twMerge(buttonStyles({ variant, size }), className)}/>
}