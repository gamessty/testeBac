import { MantineColor } from '@mantine/core';
import { locales } from './i18n/routing';
import { type User } from 'next-auth';
import { type Role } from '@prisma/client';
import { Permissions } from './data';

export const alwaysRandomUsernames = (process.env.ALWAYS_RANDOM_USERNAMES ?? 'true') === 'true';

function hashCode(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export const defaultColors: MantineColor[] = [
  'blue',
  'cyan',
  'grape',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'red',
  'teal',
  'violet',
];

export function enumToString(value: Permissions | Permissions[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(v => Permissions[v as unknown as keyof typeof Permissions].toString());
  }
  return Permissions[value as unknown as keyof typeof Permissions].toString();
}

export function getInitialsColor(name?: string, colors: MantineColor[] = defaultColors) {
  const hash = hashCode(name ?? '');
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getRandomUserName() {
  const a = ["Small", "Blue", "Ugly", "Crazy", "Fast", "Slow", "Smart", "Dumb", "Funny", "Sad", "Happy", "Angry", "Tall", "Short", "Big", "Little", "Fat", "Skinny", "Old", "Young", "Weak", "Strong", "Loud", "Quiet", "Clean", "Dirty", "Hard", "Soft", "Hot", "Cold", "Wet", "Dry", "Bright", "Dark", "Sweet", "Sour", "Bitter", "Salty", "Good", "Bad", "Right", "Wrong", "New", "Early", "Late", "Light", "Heavy", "Empty", "Full", "Sharp", "Blunt", "Smooth", "Rough", "Thick", "Thin", "Wide", "Narrow", "Near", "Far", "Deep", "Shallow", "High", "Low", "Brave", "Cowardly", "Kind", "Cruel", "Polite", "Rude", "Honest", "Dishonest", "Generous", "Greedy", "Friendly", "Unfriendly", "Clever", "Stupid", "Careful", "Careless", "Lucky", "Unlucky", "Healthy", "Sick", "Safe", "Dangerous", "Comfortable", "Uncomfortable", "Pleasant", "Unpleasant", "Beautiful", "Expensive", "Cheap", "Useful", "Useless", "Interesting", "Boring", "Exciting", "Frightening", "Difficult", "Easy", "Simple", "Complex", "Modern", "Ancient", "Natural", "Artificial", "Normal", "Strange", "Common", "Rare", "Popular", "Unpopular", "Successful", "Unsuccessful", "Possible", "Impossible", "True", "False", "Real", "Imaginary"]
  const b = ["Bear", "Dog", "Banana", "Apple", "Carrot", "Potato", "Tomato", "Cucumber", "Pumpkin", "Strawberry", "Raspberry", "Blueberry", "Blackberry", "Cherry", "Peach", "Plum", "Pear", "Orange", "Lemon", "Lime", "Grapefruit", "Watermelon", "Melon", "Pineapple", "Coconut", "Kiwi", "Mango", "Papaya", "Guava", "Passionfruit", "Lychee", "Durian", "Jackfruit", "Avocado", "Pomegranate", "Fig", "Date", "Olive", "Chestnut", "Hazelnut", "Peanut", "Almond", "Cashew", "Pistachio", "Walnut", "Macadamia", "Pecan", "Brazilnut", "Pine", "Spruce", "Fir", "Cedar", "Cypress", "Juniper", "Yew", "Hemlock", "Larch", "Redwood", "Sequoia", "Birch", "Aspen", "Poplar", "Willow", "Oak", "Beech", "Hornbeam", "Maple", "Ash", "Elm", "Sycamore", "Linden", "Apricot", "Quince", "Medlar", "Loquat", "Persimmon", "Grape", "Currant", "Gooseberry", "Cranberry"]
  const rA = Math.floor(Math.random() * a.length);
  const rB = Math.floor(Math.random() * b.length);
  return a[rA] + b[rB];
}

export function getRandomUserImageURL(seed?: string) {
  seed = seed ?? Math.random().toString(36).substring(7);
  
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
}

export function getPathsFromURL(url: string) {
  return new URL(url).pathname.split('/');
}

export function getQueryParamsFromURL(url: string) {
  return new URL(url).searchParams;
}

export function isSupportedLocale(locale: string) {
  return locales.includes(locale);
}

export const capitalize = <T extends string>(s: T) => (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

/**
 * @param {keyof typeof Permissions | (keyof typeof Permissions)[]} permission The permission to check for or an array of permissions to check for. The format for a permission is "resource:action".
 * @param {User} [user] The user to check the permission for.
 * @param {boolean} [allowWildcards=true] Whether to allow wildcards in the permission or not. Wildcards are represented by the "*" character and can only be present in the action parameter.
 * @returns {boolean} Whether the user has the permission or not.
*/
export function checkPermission(permission: string | string[], user?: User, allowWildcards: boolean = true): boolean {
  if(!user) return false;
  if(Array.isArray(permission)) return permission.some((perm) => checkPermission(perm, user, allowWildcards));
  const [resource, action] = permission.split(':')
  let allowed = user.roles?.some((role) => role.permissions.includes(permission) || role.permissions.includes(`${resource}:all`) || role.permissions.includes("all:all") || (allowWildcards && action == "*" && role.permissions.toString().includes(`${resource}:`))) ?? false;
  return allowed;
}

/**
 * @param {keyof typeof Permissions | (keyof typeof Permissions)[]} permission The permission to check for or an array of permissions to check for. The format for a permission is "resource:action".
 * @param {User} [user] The user to check the permission for.
 * @param {boolean} [allowWildcards=true] Whether to allow wildcards in the permission or not. Wildcards are represented by the "*" character and can only be present in the action parameter.
 * @returns {boolean} Whether the user has the permission or not.
*/
export const chkP: ((permission: string | string[], user?: User, allowWildcards?: boolean) => boolean) = checkPermission;

/**
 * @param {Role[]} roles The roles to get the data from.
 * @returns {Array<{ group: string, items: { value: string, label: string }[] }>} The data for the roles.
 */
export function getRolesData(roles: Role[]): { group: string, items: { value: string, label: string, disabled?: boolean }[] }[] {
  let data: { group: string, items: { value: string, label: string, disabled?: boolean }[] }[] = [];
  roles.toSorted((a, b) => b.priority - a.priority).forEach((role) => {
    if(!data.some((r) => r.group == role.category)) data.push({ group: role.category, items: [] });
    data.find((r) => r.group == role.category)?.items.push({ value: role.name, label: capitalize(role.name), disabled: role.name == "user" });
  });
  return data;
}

/**
 * 
 * @param roles The roles to get the data from.
 * @param allRoles All the roles to get the data from.
 * @returns The Array of role objects.
 */
export function getRolesFromValues(roles: string[], allRoles: Role[]): Role[] {
  return allRoles.filter((role) => roles.includes(role.name));
}


/**
 * 
 * This function gets the data for the roles from the role names. Used for the select component with prisma.
 * @param {string | string[]} roles The array of role names to get the data from or the string with the role name.
 * @param {Role[]} [allRoles] All the roles to get the data from.
 * @returns {Partial<Role>} The Array of partial role objects.
 */
export function getRolesFromArray(roles: string | string[], allRoles?: Role[]): Partial<Role>[] {
  if(!Array.isArray(roles)) return allRoles?.filter((role) => role.name == roles) ?? [{ "name": roles }];
  if(!allRoles) return roles.map((role) => ({ "name": role }));
  return allRoles.filter((role) => roles.includes(role.name));
}

/**
 * This function gets the data for the roles from the role names. Used for the select component with prisma.
 * @param {any[]} data The data to generate the prisma update data from.
 * @param {string} [key] The key to use for the update data.
 * @returns 
 */
export function getPrismaUpdateData(data: any[], {key, connectOrCreate = true}: { key?: string, connectOrCreate?: boolean }): any {
  let updateData = connectOrCreate ? { connectOrCreate: data.map((d) => ({ where: d, create: d })) } : { deleteMany: {}, connect: data };
  console.log(updateData);
  if(!key) return updateData;
  return { [key]: updateData };
}


export function getPrismaRolesUpdateData(newRoles: string[] | undefined, oldRoles: string[] | undefined)
{
  if(!newRoles) return { };
  if(!oldRoles) return {  roles: { connect: newRoles.map((role) => ({ name: role })) } };
  let rolesToDelete = oldRoles.filter((role) => !newRoles.includes(role));
  let rolesToConnect = newRoles.filter((role) => !oldRoles.includes(role));
  console.log(JSON.stringify({
    roles: {
      disconnect: rolesToDelete.map((role) => ({ name: role })),
      connect: rolesToConnect.map((role) => ({ name: role })),
    }
  }))
  return {
    roles: {
      disconnect: rolesToDelete.map((role) => ({ name: role })),
      connect: rolesToConnect.map((role) => ({ name: role })),
    }
  }
}