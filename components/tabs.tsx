import React from 'react';
import { IconHome, IconChecklist, IconChartInfographic, IconSettingsCog, IconUsers, IconUserPlus } from "@tabler/icons-react";
import { ITabData, Permissions } from "../data";
import dynamic from 'next/dynamic';

import RoleManager from "./Dashboard/Admin/RoleManager/RoleManager";
import UserManager from "./Dashboard/Admin/UserManager/UserManager";
import Home from "./Dashboard/Home/Home";
import Settings from "./Dashboard/Settings/Settings";
import Tests from "./Dashboard/Tests/Tests";
import Stats from "./Dashboard/Stats/Stats";

export const tabsData: ITabData[] = [
    {
        "tab": "home",
        "icon": IconHome,
        "component": Home,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "tests",
        "icon": IconChecklist,
        "component": Tests,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "stats",
        "icon": IconChartInfographic,
        "component": Stats,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "settings",
        "icon": IconSettingsCog,
        "component": Settings,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "admin.users",
        "icon": IconUsers,
        "component": UserManager,
        "category": {
            "name": "admin",
            "order": 1,
            "namespaced": true,
            "showLabel": true,
            "permissionNeeded": [Permissions["user:*"], Permissions["role:*"]]
        },
        "permissionNeeded": Permissions["user:manage"]
    },
    {
        "tab": "admin.roles",
        "icon": IconUserPlus,
        "component": RoleManager,
        "category": {
            "name": "admin",
            "order": 1,
            "namespaced": true,
            "showLabel": true,
            "permissionNeeded": [Permissions["user:*"], Permissions["role:*"]]
        },
        "permissionNeeded": Permissions["role:manage"]
    }
]

export default tabsData;