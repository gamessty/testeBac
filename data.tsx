import { DefaultMantineColor } from "@mantine/core";
import { Icon, IconProps } from "@tabler/icons-react";
import { Session } from "next-auth";
import { ForwardRefExoticComponent, JSX } from "react";

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

export interface ITabData {
    tab: string;
    icon: ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
    component?: (...args: any) => JSX.Element;
    disableNavigation?: boolean;
    category: { name: string, order: number, namespaced: boolean, showLabel: boolean, permissionNeeded?: Permissions | Permissions[]; };
    color?: DefaultMantineColor;
    mobile?: boolean;
    visible?: boolean;
    permissionNeeded: Permissions | Permissions[];
}

export interface ITabModuleProps {
    settab: (tabData: {tab: string, disableNavigation?: boolean}) => void;
    triggerloading: (loading: boolean) => void;
    style: React.CSSProperties;
    session: Session;
}