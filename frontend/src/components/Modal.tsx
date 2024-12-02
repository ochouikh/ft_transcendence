import { ReactNode } from "react";
import ReactDOM from "react-dom";
import { twMerge } from "tailwind-merge";

interface Props {
    children?: ReactNode
    className?: string
    isOpen: boolean
    onClose: () => void
}

function Modal({isOpen, onClose, children, className, ...props}: Props) {
    if (!isOpen) return null;

    const portal = document.getElementById('portal');
    if (!portal) return null;

    return ReactDOM.createPortal(
        <>
            <div
                onClick={onClose}
                className="w-full fixed z-50 top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.7)]"></div>
            <div 
                className={twMerge("fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", className)}
                {...props}>
                {children}
            </div>
        </>, portal
    )
}

export default Modal;