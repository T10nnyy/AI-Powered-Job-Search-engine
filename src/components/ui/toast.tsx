import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  toast: (params: ToastParams) => void
} | null>(null)

export interface ToastParams {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastParams & { id: number })[]>([])
  const idRef = React.useRef(0)

  const toast = React.useCallback(({ duration = 3000, ...params }: ToastParams) => {
    const id = idRef.current++
    setToasts(prev => [...prev, { ...params, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} type={toast.type}>
            {toast.message}
            <button 
              className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <X size={14} />
            </button>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const toastVariants = cva(
  "relative p-4 rounded-md shadow-md transition-all max-w-xs",
  {
    variants: {
      type: {
        success: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
        error: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
)

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof toastVariants> {}

function Toast({ 
  className, 
  type, 
  ...props 
}: ToastProps) {
  return (
    <div className={cn(toastVariants({ type }), className)} {...props} />
  )
}
