import {JWTHeaderParameters, JWTPayload, jwtVerify} from "jose";
import {JwkMissingError, JwtMissingError} from "../errors/errors";
import {AuthConfig, AuthResponse, JwtHeader, Jwk, JwtPayload} from "../types/types";

export class JWTVerifier {
    constructor(private config: AuthConfig) {}

    private JWKs: Jwk[] = [];

    isCryptoAvailable(): boolean {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }

    public async isValid(token: string): Promise<boolean> {
        if (!token) throw new JwtMissingError("Token not supplied to verify")
        if (this.isCryptoAvailable()) {
            const headers = this.getTokenHeaders(token);
            let jwk: Jwk | undefined = this.getJwkByKidFromCache(headers.kid);
            if (!jwk) await this.fetchJwksByKid(headers.kid);

            jwk = this.getJwkByKidFromCache(headers.kid);
            if (!jwk) throw new JwkMissingError('Could not verify payload: kid-header missing');
            await jwtVerify(token, jwk, {
                issuer: 'bullwark',
                audience: this.config.tenantUuid,
            });
            return true;
        } else if (this.config.devMode) {
            return true;
        }
        return false;
    }

    public isExpired(token: string): boolean {
        const payload = this.getTokenPayload(token);
        if(!payload.exp || Number.isNaN(payload.exp)) throw new Error("JWT exp missing or invalid");
        return (payload.exp * 1000 < Date.now())
    }

    private getTokenHeaders(token: string): JwtHeader {
        if (!token) throw new JwtMissingError('Token not supplied to get headers');
        const headers: JwtHeader = JSON.parse(atob(token.split('.')[0]));
        if (!headers) throw new Error("Invalid JWT header");
        return headers;
    }

    public getTokenPayload(token: string): JwtPayload {
        if (!token) throw new JwtMissingError('Token not supplied to get payload');
        const data = JSON.parse(atob(token.split('.')[1]));
        if (!data) throw new Error("Invalid JWT payload");
        return {
            ...data
        };
    }

    private getJwkByKidFromCache(kid: string): Jwk | undefined {
        const index = this.JWKs.findIndex((keySet: any) => keySet.kid == kid);
        if (index > -1) {
            return this.JWKs[index];
        }
        return undefined;
    }

    private async fetchJwksByKid(kid: string): Promise<void> {
        if (!kid) throw new Error('kid missing.');
        const response = await fetch(`${this.config.apiUrl}/.well-known/jwks`, {
            headers: {
                'X-Tenant-Uuid': this.config.tenantUuid,
            }
        })

        if (!response.ok) throw new Error('Could not refresh jwks');
        const data = await response.json();
        const key = data.keys.find((keySet: any) => keySet.kid === kid);
        if (!key) throw new Error('Could not refresh jwks');
        this.JWKs.push(key);
    }
}