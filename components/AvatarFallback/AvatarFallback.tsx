"use client";
import { Avatar } from "@mantine/core";
import NextImage from "next/image";
import React from "react";

function useLoaded({ crossOrigin, referrerPolicy, src, srcSet }: { crossOrigin?: string; referrerPolicy: string; src?: string; srcSet?: string }) {
    const [loaded, setLoaded] = React.useState<boolean | 'loaded' | 'error'>(false);

    React.useEffect(() => {
        if (!src && !srcSet) {
            return undefined;
        }

        setLoaded(false);

        let active = true;
        const image = new Image();
        image.onload = () => {
            if (!active) {
                return;
            }
            setLoaded('loaded');
        };
        image.onerror = () => {
            if (!active) {
                return;
            }
            setLoaded('error');
        };
        image.crossOrigin = crossOrigin ?? null;
        image.referrerPolicy = referrerPolicy;
        image.src = src ?? '';
        if (srcSet) {
            image.srcset = srcSet;
        }

        return () => {
            active = false;
        };
    }, [crossOrigin, referrerPolicy, src, srcSet]);

    return loaded;
}

export default function AvatarFallback({ src, srcSet, name, color, crossOrigin, referrerPolicy = '', children, ...others }: Readonly<{ src?: string; srcSet?: string; name?: string; color?: string; crossOrigin?: string; referrerPolicy?: string, children?: React.ReactNode }>) {
    const loaded = useLoaded({ crossOrigin, referrerPolicy, src, srcSet });
    const hasImg = src ?? srcSet;
    const hasImgNotFailing = hasImg && loaded !== 'error';

    if (hasImgNotFailing) {
        return <Avatar src={src} name={name} color={color} {...others} />;
    }
    else return <Avatar name={name} color={color} {...others}>{children}</Avatar>;
}