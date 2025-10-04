export interface AuthConfig {
    devMode?: boolean;
    apiUrl?: string;
    jwkUrl?: string;
    tenantUuid: string;
    customerUuid: string;
    useCookie?: boolean;
    autoRefresh?: boolean;
    autoRefreshBuffer?: number;
    jwkCacheTime?: number;
    userCacheTime?: number;
}
export interface Jwk {
    kid: string;
    kty: string;
    use: string;
    key_ops: string[];
    alg: string;
    n: string;
    e: string;
}
export interface User {
    uuid: string;
    email: string;
    firstName?: string;
    lastName?: string;
    customerUuid: string;
    tenantUuid?: string;
}
export interface UserData {
    user: User;
    roles: Role[];
    primaryRole: Role;
    abilities: Ability[];
}
export interface Role {
    uuid: string;
    key: string;
    label: string;
}
export interface Ability {
    uuid: string;
    key: string;
    label: string;
}
export interface SavedJwk {
    jwk: Jwk;
    expiresAt: number;
}
//# sourceMappingURL=types.d.ts.map