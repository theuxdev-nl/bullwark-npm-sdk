import {JwkMissingError, JwtMissingError} from "../errors/errors";
import {AuthConfig, Jwk, SavedJwk} from "../types/types";
import {JWTHeaderParameters, JWTPayload} from "jose";

export class JWTVerifier {
    constructor(private config: AuthConfig) {
    }

    private JWKs: SavedJwk[] = [];

    public isCryptoAvailable(): boolean {
        return typeof window !== 'undefined' &&
            typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined'
    }

    public async checkJwtValid(token: string): Promise<void> {
        if (!token) throw new JwtMissingError("Token not supplied to verify")
        if (this.isCryptoAvailable()) {
            const {jwtVerify} = await import('jose');
            const {header, payload} = this.dissectJwt(token);
            if (!header['kid']) throw new Error("KID missign from JWT!")
            if(payload['iss'] !== 'bullwark') throw new Error("JWT issuer isn't Bullwark!");
            if(this.config.tenantUuid){
                if(payload['aud'] !== this.config.tenantUuid) throw new Error("JWT audience is not the same as config's tenantUuid!")
            }

            let jwk: Jwk | undefined = this.getJwkByKidFromCache(header.kid) as Jwk;
            if (!jwk) await this.fetchJwksByKid(header.kid);

            jwk = this.getJwkByKidFromCache(header.kid);
            if (!jwk) throw new JwkMissingError('Could not verify payload: kid-header missing');

            await jwtVerify(token, jwk, {
                issuer: 'bullwark',
                audience: this.config.tenantUuid,
            });
        }
    }

    public isExpired(token: string): boolean {
        const {payload} = this.dissectJwt(token);
        if (!payload.exp || Number.isNaN(payload.exp)) throw new Error("JWT exp missing or invalid");
        return (payload.exp * 1000 < Date.now())
    }

    private getJwkByKidFromCache(kid: string): Jwk | undefined {
        const index = this.JWKs.findIndex((keySet: SavedJwk) => keySet.jwk.kid == kid);
        if (index > -1) {
            const jwk = this.JWKs[index];
            if (jwk.expiresAt > Date.now()) return jwk.jwk;
        }
        return undefined;
    }

    private async fetchJwksByKid(kid: string): Promise<void> {
        if (!kid) throw new Error('kid missing.');
        console.log(`Fetching JWKs from ` + this.config.jwkUrl + ' now.');
        const response = await fetch(`${this.config.jwkUrl}`, {
            headers: {
                'X-Tenant-Uuid': this.config.tenantUuid ?? '',
            }
        })

        if (!response.ok) throw new Error('Could not refresh jwks');
        const data = await response.json();
        const key = data.keys.find((key: Jwk) => key.kid == kid);
        if (!key) throw new Error('Could not refresh jwks');
        console.log(data);
        this.JWKs.push({
            jwk: key,
            expiresAt: Date.now() + ((this.config.jwkCacheTime ?? 86400) * 1000)
        });
    }

    public dissectJwt(jwt: string): { jwt: string, header: JWTHeaderParameters, payload: JWTPayload } {
        return {
            jwt,
            header: this.getTokenHeaders(jwt),
            payload: this.getTokenPayload(jwt),
        }
    }

    private getTokenHeaders(token: string): JWTHeaderParameters {
        if (!token) throw new JwtMissingError('Token not supplied to get headers');
        const headers: JWTHeaderParameters = JSON.parse(atob(token.split('.')[0]));
        if (!headers) throw new Error("Invalid JWT header");
        console.log(headers);
        return headers;
    }

    public getTokenPayload(token: string): JWTPayload {
        if (!token) throw new JwtMissingError('Token not supplied to get payload');
        const data: JWTPayload = JSON.parse(atob(token.split('.')[1]));
        if (!data) throw new Error("Invalid JWT payload");
        return data;
    }
}