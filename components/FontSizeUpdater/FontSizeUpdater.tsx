"use client";
import { useDidUpdate, useLocalStorage } from "@mantine/hooks";

export default function FontSizeUpdater() {
    const [fontSize] = useLocalStorage({
        key: 'fontSize',
        defaultValue: 100,
    });

    useDidUpdate(() => {
        document.documentElement.style.fontSize = `${fontSize}%`
    }, [fontSize]);

    return null;
}
