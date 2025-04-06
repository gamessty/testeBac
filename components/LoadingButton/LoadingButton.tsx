"use client";
import { Button } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { useState } from "react";

export default function LoadingButton({ children, loading, onClick,  ...props }: Readonly<any>) {
    const [localLoading, setLocalLoading] = useState(loading ?? false);

    useShallowEffect(() => {
        setLocalLoading(loading ?? false);
    }
    , [loading]);
    
    return (
        <Button {...props} loading={localLoading} onClick={(e) => { setLocalLoading(true); if(onClick) onClick(e) } }>
            {children}
        </Button>
    );
}