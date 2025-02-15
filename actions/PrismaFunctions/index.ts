import getManyRole from './getManyRole';
import postRole from './postRole';
import deleteRole from './deleteRole';
import getManyUser from './getManyUser';
import putUser from './putUser';
import deleteUser from './deleteUser';

export { default as getManyRole } from './getManyRole';
export { default as postRole } from './postRole';
export { default as deleteRole } from './deleteRole';
export { default as getManyUser } from './getManyUser';
export { default as putUser } from './putUser';
export { default as deleteUser } from './deleteUser';

export const PrismaFunctions = {
    getManyRole,
    postRole,
    deleteRole,
    getManyUser,
    putUser,
    deleteUser
}

export default PrismaFunctions;