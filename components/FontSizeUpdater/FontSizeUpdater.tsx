"use client";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

export default function FontSizeUpdater() {
    const [fontSize] = useLocalStorage({
        key: 'fontSize'
    });
    
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`
    }, [fontSize]);

    return null;
}
