import {JWTPayload} from "jose";

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

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    verified: boolean
    jwt: string
    refreshToken?: string
    detailsHash?: string
    payload?: JWTPayload,
    user?: User
}

export interface JwtHeader {
    kid: string;
    alg: string;

}

export interface JwtPayload {
    exp: number;
    iat: number;
    nbf: number;
    iss: string;
    aud: string;
    user: User;
    userUuid: string;
    tenantUuid: string;
    customerUuid: string;
    lastUpdated: string;
    detailsHash: string;
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
    email: string;
    firstName?: string;
    lastName?: string;
    roles: Role[],
    primaryRole: Role,
    abilities: Ability[]
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