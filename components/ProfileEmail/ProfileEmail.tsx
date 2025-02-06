import { auth } from '../../auth'
import { Group, Stack, Text } from '@mantine/core';
import AvatarFallback from '../AvatarFallback/AvatarFallback';

export default async function ProfileEmail() {
    const session = await auth();
    if (!session?.user) return null;
    return <Group justify="center">
        <AvatarFallback key={session.user.email} src={session.user.image ?? undefined} name={session.user.email ?? undefined} color='initials' />
        <Stack
            gap={0}
            align="flex-start"
            justify="center"
        >
            <Text mb={-5} ta="center" display={{ base: "none", md: "inherit" }}>{session?.user?.username ?? session?.user?.email}</Text>
            <Text c="dimmed" size='sm' ta="center" display={{ base: "none", md: session?.user?.username ? "inherit" : "none" }}>{session?.user?.email}</Text>
        </Stack>
    </Group>;
}