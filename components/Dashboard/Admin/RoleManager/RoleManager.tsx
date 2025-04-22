import { Accordion, Affix, Badge, Blockquote, Button, Container, Group, SimpleGrid, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Role } from "@prisma/client";
import { IconAlertTriangleFilled, IconUserPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import getManyRole from "../../../../actions/PrismaFunctions/getManyRole";
import { chkP, getInitialsColor } from "../../../../utils";
import RoleCard from "../../../Cards/RoleCard/RoleCard";
import NewRoleModal from "../../../NewRoleModal/NewRoleModal";
import styles from './RoleManager.module.css';
import { ITabModuleProps } from "@/data";

export default function RoleManager({ session, style }: Readonly<ITabModuleProps>) {
    const t = useTranslations('Dashboard.RoleManager');
    const [opened, { open, close }] = useDisclosure(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            let fetchedRoles = await getManyRole();
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

    if (!chkP("role:manage", session?.user)) return (
        <Blockquote color="red" className={styles.blockquote} cite={"– " + t('errors.fetch.title', { error: error ?? ''  })} icon={<IconAlertTriangleFilled />}>
            {t('errors.fetch.message', { error: error ?? '' })}
        </Blockquote>
    );

    return (
        <Container fluid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} style={style}>
            <Title order={1} className={styles.title}>
                {t('title')}
                <Text className={styles.text}>
                    {t('roles', { count: roles.length })}
                </Text>
            </Title>
            {
                error && (
                    <Blockquote color="red" className={styles.blockquote} cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />}>
                        {t('errors.fetch.message', { error })}
                    </Blockquote>
                )
            }
            {categories.length > 0 && (
                <Accordion multiple>
                    {
                        categories.map((category) => (
                            <Accordion.Item className={styles.accordionItem} key={category} value={category}>
                                <Accordion.Control className={styles.accordionControl}>
                                    <Group>
                                        <Badge className={styles.badge} variant="gradient" gradient={{ from: getInitialsColor(category), to: getInitialsColor(category + "_role_" + roles.filter(r => r.category == category).toString()) }} radius="sm" size="lg">
                                            {category}
                                        </Badge>
                                        <Text className={styles.text} span size="sm">
                                            {t('roles', { count: roles.filter((role) => role.category == category).length })}
                                        </Text>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel className={styles.accordionPanel}>
                                    <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}>
                                        {roles.filter((role) => role.category == category).toSorted((a, b) => b.priority - a.priority).map((role) => (
                                            <RoleCard key={role.id} role={role} h="100%" />
                                        ))}
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))
                    }
                </Accordion>
            )}
            {
                (roles.length == 0 && !error) && (
                    <SimpleGrid className={styles.simpleGrid} cols={{ xs: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}>
                        {Array.from({ length: 18 }).map((_, index) => <RoleCard key={"skeleton_users_" + index} skeleton />)}
                    </SimpleGrid>
                )
            }
            <NewRoleModal session={session} roles={roles} opened={opened} onClose={close} />
            <Affix className={styles.affix}>
                <Button
                    leftSection={<IconUserPlus />}
                    disabled={!chkP("role:create", session?.user)}
                    onClick={async () => {
                        open();
                    }}
                >
                    {t('newRole')}
                </Button>
            </Affix>
        </Container>
    )
}