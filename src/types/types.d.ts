export interface AuthConfig {
    apiUrl: string;
    tenantUuid: string;
    customerUuid: string;
    devMode?: boolean;
    useLocalStorage?: boolean;
    useCookie?: boolean;
    autoRefresh?: boolean;
    autoRefreshBuffer?: number;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface TokenHeaders {
    kid: string;
}
export interface TokenPayload {
    iat: number;
    nbf: number;
    exp: number;
    userUuid?: string;
    adminUuid?: string;
    tenantUuid?: string;
    customerUuid?: string;
    detailsHash: string;
}
export interface DecodedJwtToken {
    headers: TokenHeaders;
    payload: TokenPayload;
}
export interface AuthResponse {
    verified: boolean;
    jwt: string;
    refreshToken?: string;
    detailsHash?: string;
    user?: User;
}
export interface JwtResponse {
    verified: boolean;
    jwtToken: string;
    refreshToken?: string;
    detailsHash: string;
}
export interface LoginRefreshResponse {
    user: User;
    jwt: string;
    refreshToken?: string;
}
export interface VerifiedJwt {
    jwtToken: string;
    headers: object;
    payload: TokenPayload;
    refreshToken?: string;
}
export interface JwtHeader {
    kid: string;
    iat: number;
    iss: string;
    aud: string;
    exp: number;
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
export interface JwtAndRefresh {
    jwt: string;
    refreshToken?: string;
}
export interface AuthData {
    jwt: string;
    refreshToken?: string;
    detailsHash: string;
    user?: User;
}
//# sourceMappingURL=types.d.ts.map