import { DefaultMantineColor } from "@mantine/core";
import { Icon, IconProps } from "@tabler/icons-react";
import { ComponentType, ForwardRefExoticComponent, JSX, LazyExoticComponent, ReactNode } from "react";

/**
 * @enum {Permissions}
 */
export enum Permissions {
    "all:all",
    "user:*",
    "user:manage",
    "user:readAll",
    "developer:debug",
    "admin:*",
    "admin:panel",
    "general:*",
    "general:all",
    "user:manageRoles",
    "role:*",
    "role:manage",
}

export interface IPermissionData {
    name: Permissions;
    description: string;
}

export const PermissionsData: IPermissionData[] = [
    {
        "name": Permissions["user:manage"],
        "description": "Manage users"
    },
    {
        "name": Permissions["user:readAll"],
        "description": "Read all users"
    },
    {
        "name": Permissions["developer:debug"],
        "description": "Debug"
    },
    {
        "name": Permissions["admin:panel"],
        "description": "Admin panel"
    },
    {
        "name": Permissions["all:all"],
        "description": "All permissions"
    }
]

export interface ITabData {
    tab: string;
    description?: string;
    icon: ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
    component?: (...args: any) => JSX.Element;
    category: { name: string, order: number, namespaced: boolean, showLabel: boolean, permissionNeeded?: Permissions | Permissions[]; };
    color?: DefaultMantineColor;
    mobile?: boolean;
    permissionNeeded: Permissions | Permissions[];
}