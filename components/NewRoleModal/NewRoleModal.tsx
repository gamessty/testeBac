"use client";
import { Button, CheckIcon, Combobox, Group, Modal, ModalProps, NumberInput, Pill, PillsInput, Stack, Text, TextInput, useCombobox } from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Role } from "@prisma/client";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import postRole from "../../actions/PrismaFunctions/postRole";
import { chkP } from "../../utils";

export default function NewRoleModal({ session, roles, ...props }: Readonly<ModalProps & { session: Session, roles: Role[] }>) {
    const t = useTranslations('Dashboard.RoleManager');
    const [data, setData] = useState<{ roles: Role[], categories: string[], permissions: string[] }>({ roles: [], categories: [], permissions: [] });

    const [categories, setCategories] = useState<string[]>(data.categories);
    const [categoryValue, setCategoryValue] = useState<string>(categories[0] ?? "");
    const [categorySearch, setCategorySearch] = useState(categories[0] ?? '');

    const [permissionsSearch, setPermissionsSearch] = useState('');
    const [permissions, setPermissions] = useState(data.permissions);
    const [permissionsValue, setPermissionsValue] = useState<string[]>(["general:*"]);


    const exactCategoryOptionMatch = categories.some((item) => item === categorySearch);
    const filteredCategoryOptions = exactCategoryOptionMatch
        ? categories
        : categories.filter((item) => item.toLowerCase().includes(categorySearch.toLowerCase().trim()));

    const categoryOptions = filteredCategoryOptions.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    const exactPermissionsOptionMatch = permissions.some((item) => item === permissionsSearch);

    const handlePermissionsValueSelect = (val: string) => {
        setPermissionsSearch('');

        if (val === '$create') {
            setPermissions((current) => [...current, permissionsSearch]);
            setPermissionsValue((current) => [...current, permissionsSearch]);
        } else {
            setPermissionsValue((current) =>
                current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
            );
        }
    };

    const handlePermissionsValueRemove = (val: string) =>
        setPermissionsValue((current) => current.filter((v) => v !== val));

    const permissionsValues = permissionsValue.map((item) => (
        <Pill key={item} withRemoveButton onRemove={() => handlePermissionsValueRemove(item)}>
            {item}
        </Pill>
    ));

    const permissionsOptions = permissions
        .filter((item) => item.toLowerCase().includes(permissionsSearch.trim().toLowerCase()))
        .map((item) => (
            <Combobox.Option value={item} key={item} active={permissionsValue.includes(item)}>
                <Group gap="sm">
                    {permissionsValue.includes(item) ? <CheckIcon size={12} /> : null}
                    <span>{item}</span>
                </Group>
            </Combobox.Option>
        ));

    useEffect(() => {
        if (roles.length > 0) {
            let fetchedCategories = [...new Set(roles.toSorted((a, b) => b.priority - a.priority).map((role) => role.category))];
            let fetchedPermissions = [...new Set(roles.toSorted((a, b) => b.priority - a.priority).map((role) => role.permissions).flat())].toSorted((a, b) => {
                const [resA, actA] = a.split(':');
                const [resB, actB] = b.split(':');

                if (resA === resB) {
                    return actA === 'all' ? -1 : actB === 'all' ? 1 : actA.localeCompare(actB);
                }

                return resA.localeCompare(resB);
            })
            setCategories(fetchedCategories);
            setCategoryValue(fetchedCategories[fetchedCategories.length - 1]);
            setCategorySearch(fetchedCategories[fetchedCategories.length - 1]);
            setPermissions(fetchedPermissions);
            setData({ roles, categories: fetchedCategories, permissions: fetchedPermissions });
        }
    }, [roles])

    const categoryCombobox = useCombobox({
        onDropdownClose: () => categoryCombobox.resetSelectedOption(),
    });

    const permissionsCombobox = useCombobox({
        onDropdownClose: () => permissionsCombobox.resetSelectedOption(),
        onDropdownOpen: () => permissionsCombobox.updateSelectedOptionIndex('active'),
    });

    interface PartialRole extends Omit<Role, "id" | "userIDs" | "createdAt" | "updatedAt"> { }

    const handleRoleCreate = async (role: PartialRole) => {
        try {
            const res = await postRole({ roleData: role });
            if (res && 'message' in res) {
                throw new Error(res.message);
            }
            else {
                props.onClose();
                notifications.show({
                    title: t('success.create.title'),
                    message: t('success.create.message', { name: role.name }),
                    color: "green"
                })
            }
        } catch (error: any) {
            notifications.show({
                title: t('errors.fetch.title', { error: error.message }),
                message: t("errors.fetch.message", { error: error.message }) + " " + t("errors.role.message", { name: role.name }),
                color: "red"
            })
        }
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const priority = Number(formData.get('priority'));
        const category = categoryValue;
        const permissions = permissionsValue;
        const role = { name, description, priority, category, permissions };
        modals.openConfirmModal({
            title: t('confirm.create.title'),
            children: (
                <Text size="sm">
                    {t("confirm.create.message", { name: role.name })}
                </Text>
            ),
            labels: { confirm: "Create", cancel: "Cancel" },
            onConfirm: () => {
                handleRoleCreate(role);
            }
        })
    };

    if (!chkP("role:create", session?.user))
        return (
            <Modal {...props} title={t('errors.fetch.title', { error: 'Unauthorized' })} {...props}>
                <Text size="sm">
                    {t('errors.fetch.message', { error: 'Unauthorized' })}
                </Text>
                <Button onClick={props.onClose} color="blue" fullWidth mt={10}>
                    {t('close')}
                </Button>
            </Modal>
        );
    else
        return (
            <Modal {...props} title={t('newRole')}>
                <form onSubmit={handleFormSubmit}>
                    <Stack>
                        <Group justify="space-between">
                            <TextInput name="name" required label={t('drawer.name.label')} defaultValue={randomId('role-')} withAsterisk onChange={() => { /* WIP */ }} placeholder={t('drawer.name.placeholder')} />
                            <Combobox
                                store={categoryCombobox}
                                withinPortal={true}
                                onOptionSubmit={(val) => {
                                    if (val === '$create') {
                                        setCategories((current) => [...current, categorySearch]);
                                        setCategoryValue(categorySearch);
                                    } else {
                                        setCategoryValue(val);
                                        setCategorySearch(val);
                                    }

                                    categoryCombobox.closeDropdown();
                                }}
                            >

                                <Combobox.Target>
                                    <TextInput label={t('drawer.category.label')} withAsterisk
                                        rightSection={<Combobox.Chevron />}
                                        value={categorySearch}
                                        onChange={(event) => {
                                            categoryCombobox.openDropdown();
                                            categoryCombobox.updateSelectedOptionIndex();
                                            setCategorySearch(event.currentTarget.value);
                                        }}
                                        onClick={() => categoryCombobox.openDropdown()}
                                        onFocus={() => categoryCombobox.openDropdown()}
                                        onBlur={() => {
                                            categoryCombobox.closeDropdown();
                                            setCategorySearch(categoryValue ?? '');
                                        }}
                                        placeholder={t('drawer.category.placeholder')}
                                        rightSectionPointerEvents="none"
                                    />
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                        {categoryOptions}
                                        {!exactCategoryOptionMatch && categorySearch.trim().length > 0 && (
                                            <Combobox.Option value="$create">+ {t('create')} {categorySearch}</Combobox.Option>
                                        )}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        </Group>
                        <Group justify="space-between" grow>
                            <TextInput
                                name="description"
                                label={t('drawer.description.label')}
                                placeholder={t('drawer.description.placeholder')}
                            />
                            <NumberInput
                                withAsterisk
                                label={t('drawer.priority.label')}
                                placeholder={t('drawer.priority.placeholder')}
                                clampBehavior="strict"
                                defaultValue={0}
                                name="priority"
                                min={0}
                                step={5}
                                max={Math.max(...session.user.roles.map((role) => role.priority)) ?? 0}
                            />
                        </Group>
                        <Combobox store={permissionsCombobox} onOptionSubmit={handlePermissionsValueSelect} withinPortal={true}>
                            <Combobox.DropdownTarget>
                                <PillsInput onClick={() => permissionsCombobox.openDropdown()} label={t('drawer.permissions.label')} withAsterisk>
                                    <Pill.Group>
                                        {permissionsValues}

                                        <Combobox.EventsTarget>
                                            <PillsInput.Field
                                                onFocus={() => permissionsCombobox.openDropdown()}
                                                onBlur={() => permissionsCombobox.closeDropdown()}
                                                value={permissionsSearch}
                                                placeholder={t('drawer.permissions.placeholder')}
                                                onChange={(event) => {
                                                    permissionsCombobox.updateSelectedOptionIndex();
                                                    setPermissionsSearch(event.currentTarget.value);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Backspace' && permissionsSearch.length === 0) {
                                                        event.preventDefault();
                                                        handlePermissionsValueRemove(permissionsValue[permissionsValue.length - 1]);
                                                    }
                                                }}
                                            />
                                        </Combobox.EventsTarget>
                                    </Pill.Group>
                                </PillsInput>
                            </Combobox.DropdownTarget>

                            <Combobox.Dropdown>
                                <Combobox.Options>
                                    {permissionsOptions}

                                    {!exactPermissionsOptionMatch && permissionsSearch.trim().length > 0 && /^([a-z0-9_-]+):([a-zA-Z0-9_*]+)$/.test(permissionsSearch) && (
                                        <Combobox.Option value="$create">+ {t('create')} {permissionsSearch}</Combobox.Option>
                                    )}

                                    {exactPermissionsOptionMatch && permissionsSearch.trim().length > 0 && permissionsOptions.length === 0 && (
                                        <Combobox.Empty>{t('nothingFound')}</Combobox.Empty>
                                    )}
                                </Combobox.Options>
                            </Combobox.Dropdown>
                        </Combobox>
                    </Stack>
                    <Button type="submit" color="blue" fullWidth mt={20}>
                        {t('create')}
                    </Button>

                </form>
            </Modal>
        );
}