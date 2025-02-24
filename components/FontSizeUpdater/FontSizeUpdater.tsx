"use client";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

export default function FontSizeUpdater() {
    const [fontSize] = useLocalStorage({
        key: 'fontSize',
        defaultValue: 100,
    });

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`
    }, [fontSize]);

    return null;
}
