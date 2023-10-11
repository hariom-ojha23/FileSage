'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const onOpenChange = (v: boolean) => {
        if (!v) setIsOpen(v)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>Example Content</DialogContent>
        </Dialog>
    )
}


export default UploadButton