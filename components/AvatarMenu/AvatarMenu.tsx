'use client';
import { AvatarProps, Menu, MenuProps, UnstyledButton } from "@mantine/core";
import AvatarFallback from "../AvatarFallback/AvatarFallback";

export default function AvatarMenu({ AvatarProps, children, ...rest }: Readonly<{ AvatarProps: AvatarProps, children?: React.ReactNode } & Omit<MenuProps, 'children'>>) {
    return (
        <Menu {...rest}>
            <Menu.Target>
                <UnstyledButton>
                    <AvatarFallback {...AvatarProps} />
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown w={160}>
                {children}
            </Menu.Dropdown>
        </Menu>
    )
}