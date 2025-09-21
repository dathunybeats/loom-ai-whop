import * as React from "react"
import { Button as HeroButton, ButtonProps as HeroButtonProps, Spinner } from "@heroui/react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-black text-white shadow-xs hover:bg-black/90",
        destructive: "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-600/20",
        outline: "border border-black bg-transparent shadow-xs hover:bg-black hover:text-white",
        secondary: "bg-gray-200 text-black shadow-xs hover:bg-gray-300",
        ghost: "hover:bg-black/10 hover:text-black",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends Omit<HeroButtonProps, 'color' | 'variant' | 'size'> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  isLoading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <HeroButton
      className={cn(buttonVariants({ variant, size }), className)}
      color="default"
      data-slot="button"
      isLoading={isLoading}
      spinner={
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      }
      {...props}
    >
      {children}
    </HeroButton>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
