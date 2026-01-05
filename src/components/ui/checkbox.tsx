"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
    checked?: boolean | 'indeterminate'
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null)

        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

        React.useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = checked === 'indeterminate'
            }
        }, [checked])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked)
        }

        return (
            <div className="relative flex items-center justify-center size-5">
                <input
                    type="checkbox"
                    className="peer absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    checked={checked === true || checked === 'indeterminate'}
                    onChange={handleChange}
                    disabled={disabled}
                    ref={inputRef}
                    {...props}
                />
                <div className={cn(
                    "absolute inset-0 pointer-events-none flex items-center justify-center rounded-[6px] border border-zinc-700 bg-zinc-900/50 transition-all duration-200",
                    "peer-hover:border-zinc-500 peer-hover:bg-zinc-800",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30",
                    (checked === true || checked === 'indeterminate') && "bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-500 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)] peer-hover:border-indigo-400",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}>
                    {checked === true && <Check className="size-3.5 text-white stroke-[3.5]" />}
                    {checked === 'indeterminate' && <Minus className="size-3.5 text-white stroke-[3.5]" />}
                </div>
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
