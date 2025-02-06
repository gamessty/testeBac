import { DefaultMantineColor } from "@mantine/core";
import { JSX } from "react";

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
    "user:manageRoles"
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
    icon: React.ReactNode;
    component?: (...args: any) => JSX.Element;
    category: { name: string, order: number, namespaced: boolean, showLabel: boolean, permissionNeeded?: Permissions | Permissions[]; };
    color?: DefaultMantineColor;
    permissionNeeded: Permissions | Permissions[];
}