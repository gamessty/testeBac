//TRANSLATION NEEDED
'use client';
import { Group, Menu, Stack, Text } from '@mantine/core';
import AvatarFallback from '../AvatarFallback/AvatarFallback';
import './ProfileEmail.module.css';
import AvatarMenu from '../AvatarMenu/AvatarMenu';
import { Session } from 'next-auth';
import { IconLogout } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

export default function ProfileEmail({ session }: Readonly<{ session: Session }>) {
    if (!session?.user) return null;
    return <Group justify="center" className="profileEmail" gap={0}>
        <AvatarFallback display={{ base: "none", md: 'initial' }} src={session.user.image ?? undefined} name={session.user.email ?? undefined} color='initials' />
        <AvatarMenu withArrow shadow="md" position="bottom" offset={20} transitionProps={{ transition: 'pop-top-right', duration: 200 }} AvatarProps={{ display: { base: undefined, md: "none" }, src: session?.user?.image ?? undefined, name: session?.user?.username ?? session?.user?.email ?? undefined, color: 'initials' }}>

            <Menu.Item color="red" onClick={() => signOut()} leftSection={<IconLogout size={14} />}>
                Log out
            </Menu.Item>

        </AvatarMenu>
        <Stack
            gap={0}
            align="flex-start"
            justify="center"
            ml={{ base: 0, md: 5 }}
        >
            <Text mb={-5} ta="center" display={{ base: "none", md: "inherit" }}>{session?.user?.username ?? session?.user?.email}</Text>
            <Text c="dimmed" size='sm' ta="center" display={{ base: "none", md: session?.user?.username ? "inherit" : "none" }}>{session?.user?.email}</Text>
        </Stack>
    </Group>;
}
