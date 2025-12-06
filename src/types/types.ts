export interface AuthConfig {
    devMode?: boolean;
    apiUrl?: string;
    jwkUrl?: string;
    useCookie?: boolean;
    autoRefresh?: boolean;
    autoRefreshBuffer?: number;
    jwkCacheTime?: number;
    userCacheTime?: number;

    tenantUuid: string;
    customerUuid: string;
}

export interface Jwk {
    kid: string;
    kty: string;
    use: string;
    key_ops: string[],
    alg: string;
    n: string;
    e: string;
}

export interface User {
    uuid: string;
    abilities: string[];
    roles: string[];
    isAdmin: boolean;

    tenantUuid: string;
    customerUuid: string;
}

export interface Ability {
    uuid: string;
    key: string;
    label: string;

    customerUuid: string;
    tenantUuid: string;
}

export interface Role {
    uuid: string;
    key: string;
    label: string;

    customerUuid: string;
    tenantUuid: string;
}

export interface SavedJwk {
    jwk: Jwk;
    expiresAt: number;
}