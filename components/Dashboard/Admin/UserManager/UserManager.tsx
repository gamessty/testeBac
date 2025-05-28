"use client";

import { Blockquote, Button, Checkbox, CloseButton, Container, ContainerProps, Drawer, Grid, Group, Input, JsonInput, Loader, MultiSelect, SimpleGrid, Stack, Text, TextInput, Title, Transition } from "@mantine/core";
import { useDebouncedCallback, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Role } from "@prisma/client";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { type Session, type User } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import deleteUser from "../../../../actions/PrismaFunctions/deleteUser";
import getManyRole from "../../../../actions/PrismaFunctions/getManyRole";
import getManyUser from "../../../../actions/PrismaFunctions/getManyUser";
import putUser from "../../../../actions/PrismaFunctions/putUser";
import { chkP, getManyRoleData, getManyRoleFromValues, getPrismaRolesUpdateData } from "@/utils";
import AvatarFallback from "../../../AvatarFallback/AvatarFallback";
import UserCardList from "@/components/UserCardList/UserCardList";
import { sendAuthorisedEmail } from "@/actions/authorisedEmail";

export default function UserManager({ session, style }: Readonly<{ session: Session | null | undefined } & ContainerProps>) {
    const t = useTranslations('Dashboard.UserManager');
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([] as User[]);
    const [users, setUsers] = useState([] as User[]);
    const [roles, setRoles] = useState([] as Role[]);
    const [user, setUser] = useState({} as User);
    const [userChanges, setUserChanges] = useState<Partial<User>>({} as User);
    const [debouncedUserChanges] = useDebouncedValue(userChanges, 1000);
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
        async function fetchData() {
            let fetchedUsers = await getManyUser();
            let fetchedRoles = await getManyRole();
            if (!Array.isArray(fetchedUsers) && fetchedUsers?.message) {
                return setError(fetchedUsers.message);
            }
            else if (!Array.isArray(fetchedRoles) && fetchedRoles?.message) {
                return setError(fetchedRoles.message);
            }
            else if (Array.isArray(fetchedUsers) && Array.isArray(fetchedRoles)) {
                setUsers(fetchedUsers);
                setRoles(fetchedRoles);
                setSearchResults(fetchedUsers);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        setSearchResults(users);
    }, [users]);

    function updateUsersAfterChange(userUp: User = user, clearUserChanges: boolean = false, deleteUser: boolean = false) {
        if (clearUserChanges) setUserChanges({} as User);
        if (deleteUser) return setUsers(users.filter((u) => u.id !== userUp.id));
        setUsers(users.map((u) => u.id === userUp.id ? userUp : u));
    }

    const handleSearch = useDebouncedCallback(async (query: string) => {
        setLoading(true);
        setSearchResults(users.filter((user) => user.username?.toLowerCase().includes(query.toLowerCase()) || user.email?.toLowerCase().includes(query.toLowerCase()) || user.id?.toString().includes(query) || user.name?.toLowerCase().includes(query.toLowerCase()) || user.roles?.toString().toLowerCase().includes(query.toLowerCase())));
        setLoading(false);
    }, 500);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value);
        handleSearch(event.currentTarget.value);
    }

    if (!chkP("user:manage", session?.user)) return (<Blockquote mx="xl" w="100%" color="red" cite={"– " + t('errors.fetch.title', { error: 'Unauthorized' })} icon={<IconAlertTriangleFilled />} mt="xl">
        {t('errors.fetch.message', { error: 'Unauthorized' })}
    </Blockquote>);

    return <Container fluid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} style={style}>
        <Title order={1} w="100%" ta="left" mb={20}>
            {t('title')}
            <Text c="dimmed" ml={5} ta="left">
                {t('users', { count: users.length })}
            </Text>
        </Title>
        {
            error && <Blockquote mx="xl" w="100%" color="red" cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />} mt="xl">
                {t('errors.fetch.message', { error })}
            </Blockquote>
        }
        <TextInput
            display={chkP('user:manage', session?.user) ? "inherit" : "none"}
            value={search}
            onChange={handleChange}
            placeholder="Search..."
            mb={20}
            leftSection={loading && <Loader variant="bars" size={20} />}
            rightSection={search.length > 0 && <CloseButton onClick={() => { setSearch(""); setSearchResults(users); }} variant="link" color="red" />}
        />
        <UserCardList users={searchResults} onUserClick={(user) => { setUser(user); open(); }} skeleton={users.length == 0 && !error} numberOfCards={18} />
        <Drawer position="right" opened={opened} onClose={close}
            onExitTransitionEnd={() => { setUser({} as User); setUserChanges({} as User); }}
            title={
                <Group justify="flex-start" mb="xs">
                    <AvatarFallback name={user?.username ?? user?.email ?? undefined} src={user?.image ?? undefined} color="initials" />
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
            <Group mt={20}>
                <AvatarFallback name={user?.username ?? user?.email ?? undefined} src={debouncedUserChanges.image ?? user?.image ?? undefined} color="initials" />
                <Input.Wrapper label={t('drawer.avatar.label')} withAsterisk style={{ flexGrow: 1 }}>
                    <Input onChange={(Event) => { if (user.image != Event.currentTarget.value) { setUserChanges({ image: Event.currentTarget.value }) } else { setUserChanges((current) => { const newUser = { ...current }; delete newUser["image"]; return newUser; }) } }} defaultValue={user?.image ?? undefined} placeholder={t('drawer.avatar.placeholder')} />
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
            <Group w="100%" justify="space-between" mt={20}>
                <Button
                disabled={!user?.userAuthorized || !user.email || user.email == null || user.email == ""}
                    defaultChecked={user?.userAuthorized}
                    onClick={(event) => { user.email && sendAuthorisedEmail(user?.email , 'fr'); }}
                >
                    <Text>{t('drawer.userAuthorizedEmail.description')}</Text>
                </Button>
            </Group>
            <MultiSelect
                label={t('drawer.roles.label')}
                placeholder={t('drawer.roles.placeholder')}
                tt="capitalize"
                w='100%'
                mt={20}
                defaultValue={user?.roles?.map((role) => role.name)}
                onChange={(value) => { putUser({ id: user?.id, data: getPrismaRolesUpdateData(value, user.roles?.map(r => r.name)) }); setUser({ ...user, roles: getManyRoleFromValues(value, roles) }); updateUsersAfterChange({ ...user, roles: getManyRoleFromValues(value, roles) }); }}
                data={getManyRoleData(roles)}
                disabled={!chkP("user:manageRoles", session?.user)}
            />
            <Group mt={20} justify="flex-end">
                {
                    //implement a confirmation dialog
                    chkP('user:delete', session?.user) && session?.user?.id != user.id && <Button color="red" onClick={() => { deleteUser({ id: user?.id }); updateUsersAfterChange({ ...user, ...userChanges }, true, true); close(); }}>
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