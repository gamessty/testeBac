import { auth } from '../../auth'
import { Avatar, Group, Text } from '@mantine/core';

export default async function ProfileEmail() {
    const session = await auth();
    if (!session?.user) return null;
    return <Group justify="center"><Avatar key={session.user.email} src={session.user.image ?? undefined} name={session.user.email ?? undefined} color='initials'/> <Text ta="center" display={{ base: "none", md: "inherit"}}>{session?.user?.email}</Text></Group>;
}