export interface AuthConfig {
    apiUrl: string;
    tenantUuid: string;
    useCookie?: boolean;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface TokenHeaders {
    kid: string;
}
export interface TokenPayload {
    iat?: number;
    nbf?: number;
    exp?: number;
    userUuid?: string;
    adminUuid?: string;
    tenantUuid?: string;
    customerUuid?: string;
    detailsHash?: string;
}
export interface DecodedJwtToken {
    headers: TokenHeaders;
    payload: TokenPayload;
}
export interface AuthResponse {
    jwtToken: string;
    refreshToken?: string;
}
export interface JwtResponse {
    jwtToken: string;
    refreshToken?: string;
}
export interface VerifiedJwt {
    jwtToken: string;
    headers: Object;
    payload: TokenPayload;
}
export interface Jwkey {
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
//# sourceMappingURL=types.d.ts.map