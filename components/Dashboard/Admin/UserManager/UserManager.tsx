"use client";

import { Container, MantineStyleProp, SimpleGrid, Text, Title, Drawer, Avatar, Group, Stack, Input, Checkbox, TagsInput, MultiSelect, Button, Transition, JsonInput, Blockquote, TextInput, Loader, CloseButton } from "@mantine/core";
import { type Session, type User } from "next-auth";
import { useTranslations } from "next-intl";
import UserCard from "../../UserCard/UserCard";
import getUsers from "../../../PrismaFunctions/getUsers";
import { useEffect, useState } from "react";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import putUser from "../../../PrismaFunctions/putUser";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import deleteUser from "../../../PrismaFunctions/deleteUser";

interface UserManagerProps {
    session: Session | null | undefined;
    style?: MantineStyleProp;
}

export default function UserManager({ session, style }: Readonly<UserManagerProps>) {
    const t = useTranslations('Dashboard.UserManager');
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([] as User[]);
    const [users, setUsers] = useState([] as User[]);
    const [user, setUser] = useState({} as User);
    const [userChanges, setUserChanges] = useState({} as User);
    const [opened, { open, close }] = useDisclosure(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function isEmpty(obj: any) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    useEffect(() => {
        async function fetchUsers() {
            let fetchedUsers = await getUsers();
            if (!Array.isArray(fetchedUsers) && fetchedUsers?.message) {
                setError(fetchedUsers.message);
            }
            else if (Array.isArray(fetchedUsers)) {
                setUsers(fetchedUsers);
                setSearchResults(fetchedUsers);
            }
        }
        fetchUsers();
    }, []);

    function updateUsersAfterChange(userUp: User = user, clearUserChanges: boolean = false, deleteUser: boolean = false) {
        if (clearUserChanges) setUserChanges({});
        if (deleteUser) return setUsers(users.filter((u) => u.id !== userUp.id));
        setUsers(users.map((u) => u.id === userUp.id ? userUp : u));
    }

    const handleSearch = useDebouncedCallback(async (query: string) => {
        setLoading(true);
        setSearchResults(users.filter((user) => user.username?.toLowerCase().includes(query.toLowerCase()) || user.email?.toLowerCase().includes(query.toLowerCase()) || user.id?.toString().includes(query) || user.name?.toLowerCase().includes(query.toLowerCase())));
        setLoading(false);
    }, 500);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value);
        handleSearch(event.currentTarget.value);
    }

    if (!session?.user.roles.includes("admin")) return <Text>Unauthorized</Text>;

    return <Container fluid p={{ base: 25, sm: 35 }} pt={{ base: 5, sm: 10 }} pb={95} style={style}>
        <Title order={1} w="100%" ta="left" mb={20}>
            {t('title')}
            <Text c="dimmed" ml={5} ta="left">
                {t('users', { count: users.length })}
            </Text>
        </Title>
        {
            error && <Blockquote w="100%" color="red" cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />} mt="xl">
                {t('errors.fetch.message', { error })}
            </Blockquote>
        }
        <TextInput
            value={search}
            onChange={handleChange}
            placeholder="Search..."
            mb={20}
            leftSection={loading && <Loader variant="bars" size={20} />}
            rightSection={search.length > 0 && <CloseButton onClick={() => { setSearch(""); setSearchResults(users); }} variant="link" color="red" />}
        />
        <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 5, xxl: 6 }} >
            {searchResults.map((user) => <UserCard onClick={() => { setUser(user); open() }} key={user.id} user={user} />)}
            {
                ((users.length == 0 && !error) || loading) && Array.from({ length: 18 }).map((_, index) => <UserCard key={"skeleton_users_" + index} skeleton />)
            }
        </SimpleGrid>
        <Drawer position="right" opened={opened} onClose={close} title={
            <Group justify="flex-start" mb="xs">
                <Avatar name={user?.username ?? user?.email ?? undefined} src={user?.image ?? undefined} color="initials" />
                <Stack
                    gap={0}
                    align="flex-start"
                    justify="center"
                >
                    <Text fw={500} mb={-5} ta="center">{user?.username ?? user?.email}</Text>
                    <Text c="dimmed" size='sm' ta="center" display={{ base: user?.username ? "inherit" : "none" }}>{user?.email}</Text>
                </Stack>
            </Group>
        }>
            <Group justify="space-between">
                <Input.Wrapper label={t('drawer.username.label')} withAsterisk>
                    <Input onChange={(Event) => { if (user.username != Event.currentTarget.value) { setUserChanges({ username: Event.currentTarget.value }) } else { setUserChanges((current) => { const newUser = { ...current }; delete newUser["username"]; return newUser; }) } }} defaultValue={user?.username ?? undefined} placeholder={t('drawer.username.placeholder')} />
                </Input.Wrapper>
                <Input.Wrapper label={t('drawer.email.label')} withAsterisk>
                    <Input value={user?.email ?? undefined} placeholder={t('drawer.email.placeholder')} disabled />
                </Input.Wrapper>
            </Group>
            <Group w="100%" justify="space-between" mt={20}>
                <Checkbox
                    defaultChecked={user?.userAuthorized}
                    label={t('drawer.authorized.label')}
                    description={t('drawer.authorized.description')}
                    onChange={(event) => { putUser({ id: user?.id, data: { userAuthorized: event.currentTarget.checked } }); setUser({ ...user, userAuthorized: event.currentTarget.checked }); updateUsersAfterChange({ ...user, userAuthorized: event.currentTarget.checked }); }}
                />
            </Group>
            <MultiSelect
                label={t('drawer.roles.label')}
                placeholder={t('drawer.roles.placeholder')}
                tt="capitalize"
                w='100%'
                mt={20}
                defaultValue={user?.roles}
                onChange={(value) => { putUser({ id: user?.id, data: { roles: value } }); setUser({ ...user, roles: value }); updateUsersAfterChange({ ...user, roles: value }); }}
                data={[
                    { group: 'Admin', items: [{ value: 'admin', label: 'Admin' }, { value: 'owner', label: 'Owner' }] },
                    { group: 'General', items: [{ value: 'user', label: 'User', disabled: true }] }
                ]}
                disabled={!session?.user.roles.includes("owner")}
            />
            <Group mt={20} justify="flex-end">
                {
                    //implement a confirmation dialog
                    session.user.roles.includes("owner") && session.user?.id != user.id && <Button color="red" onClick={() => { deleteUser({ id: user?.id }); updateUsersAfterChange({ ...user, ...userChanges }, true, true); }}>
                        {t('drawer.delete')}
                    </Button>
                }
                <Transition duration={200} timingFunction="ease" transition="fade" mounted={!isEmpty(userChanges)}>
                    {(transitionStyles) => (
                        <Button color="blue" style={transitionStyles} onClick={() => { putUser({ id: user?.id, data: userChanges }); setUser({ ...user, ...userChanges }); updateUsersAfterChange({ ...user, ...userChanges }, true); }}>
                            {t('drawer.save')}
                        </Button>
                    )}
                </Transition>
            </Group>
            <JsonInput
                formatOnBlur
                autosize
                value={JSON.stringify(user, null, 2)}
                disabled
                minRows={4}
                mt={20}
            />
        </Drawer>
    </Container>
}