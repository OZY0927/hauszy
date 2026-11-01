// Firebase UIDs identify accounts; they are not secrets. Keep this list aligned with both rules files.
export const ADMIN_UIDS=['7gyEPhGlL6V8DlLb5dNGzuwO95A2'];
export const isAllowedAdminUid=uid=>typeof uid==='string'&&ADMIN_UIDS.includes(uid);
// UI convenience only. Firebase rules and server JWT verification enforce access independently.
export function isAdminToken(token){return token?.signInProvider==='password'&&isAllowedAdminUid(token?.claims?.sub)}
