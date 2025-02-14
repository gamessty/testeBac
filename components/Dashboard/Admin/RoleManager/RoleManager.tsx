//NOT YET DONE WIP
import { Session } from "next-auth";
import { ContainerProps, Container, Blockquote, Title, Text, SimpleGrid, Accordion, useMatches, Affix, Button, Badge } from "@mantine/core";
import { IconAlertTriangleFilled, IconUserPlus } from "@tabler/icons-react";
import { chkP, getInitialsColor } from "../../../../utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import getRoles from "../../../PrismaFunctions/getRoles";
import RoleCard from "../../RoleCard/RoleCard";
import NewRoleModal from "../../../NewRoleModal/NewRoleModal";
import { useDisclosure } from "@mantine/hooks";

export default function RoleManager({ session, ...props }: Readonly<{ session: Session } & ContainerProps>) {
    const t = useTranslations('Dashboard.RoleManager');
    const [opened, { open, close }] = useDisclosure(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            let fetchedRoles = await getRoles();
            if (!Array.isArray(fetchedRoles) && fetchedRoles?.message) {
                return setError(fetchedRoles.message);
            }
            else if (Array.isArray(fetchedRoles)) {
                let fetchedCategories = [...new Set(fetchedRoles.toSorted((a, b) => b.priority - a.priority).map((role) => role.category))];
                setCategories(fetchedCategories);
                setRoles(fetchedRoles);
            }
        }
        fetchData();
    }, []);

    const affixPosition = useMatches({
        base: { bottom: 140, right: 20 },
        sm: { bottom: 65, right: 20 }
    })

    if (!chkP("role:manage", session?.user)) return (<Blockquote w="100%" color="red" cite={"– " + t('errors.fetch.title', { error: 'Unauthorized' })} icon={<IconAlertTriangleFilled />} mt="xl">
        {t('errors.fetch.message', { error: 'Unauthorized' })}
    </Blockquote>);


    return (
        <Container fluid p={{ base: 5, sm: 25 }} pt={{ base: 5, sm: 10 }} pb={95} {...props}>
            <Title order={1} w="100%" ta="left" mb={20}>
                {t('title')}
                <Text c="dimmed" ml={5} ta="left">
                    {t('roles', { count: roles.length })}
                </Text>
            </Title>
            {
                error && <Blockquote w="100%" color="red" cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />} mt="xl">
                    {t('errors.fetch.message', { error })}
                </Blockquote>
            }
            {categories.length > 0 && <Accordion multiple defaultValue={categories}>
                {
                    categories.map((category) => (
                        <Accordion.Item tt="capitalize" key={category} w="100%" mb={20} value={category}>
                            <Accordion.Control >
                                <Badge variant="gradient" gradient={{ from: getInitialsColor(category), to: getInitialsColor(category + "_role_" + roles.filter(r => r.category == category).toString()) }} radius="sm" size="lg" style={{ cursor: "pointer" }}>
                                    {category}
                                </Badge>
                                <Text c="dimmed" ml={10} ta="left" span size="sm">
                                    {t('roles', { count: roles.filter((role) => role.category == category).length })}
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}>
                                    {roles.filter((role) => role.category == category).toSorted((a, b) => b.priority - a.priority).map((role) => (
                                        <RoleCard key={role.id} role={role} />
                                    ))}
                                </SimpleGrid>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                }
            </Accordion>}
            {
                (roles.length == 0 && !error) && <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}> {Array.from({ length: 18 }).map((_, index) => <RoleCard key={"skeleton_users_" + index} skeleton />)}</SimpleGrid>
            }
            <NewRoleModal session={session} roles={roles} opened={opened} onClose={close} />
            <Affix position={affixPosition}>
                <Button
                    leftSection={<IconUserPlus />}
                    disabled={!chkP("role:create", session?.user)}
                    onClick={async () => {
                        open();
                        console.log("NEW USER");
                    }}
                >
                    {t('newRole')}
                </Button>
            </Affix>
        </Container>
    )
}