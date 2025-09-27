import { jwtVerify } from "jose";
import { JwkMissingError, JwtMissingError } from "../errors/errors";
export class JWTVerifier {
    constructor(config) {
        this.config = config;
        this.JWKs = [];
    }
    isCryptoAvailable() {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }
    async isValid(token) {
        if (!token)
            throw new JwtMissingError("Token not supplied to verify");
        if (this.isCryptoAvailable()) {
            const headers = this.getTokenHeaders(token);
            let jwk = this.getJwkByKidFromCache(headers.kid);
            if (!jwk)
                await this.fetchJwksByKid(headers.kid);
            jwk = this.getJwkByKidFromCache(headers.kid);
            if (!jwk)
                throw new JwkMissingError('Could not verify payload: kid-header missing');
            await jwtVerify(token, jwk, {
                issuer: 'bullwark',
                audience: this.config.tenantUuid,
            });
            return true;
        }
        else if (this.config.devMode) {
            return true;
        }
        return false;
    }
    isExpired(token) {
        const payload = this.getTokenPayload(token);
        if (!payload.exp || Number.isNaN(payload.exp))
            throw new Error("JWT exp missing or invalid");
        return (payload.exp * 1000 < Date.now());
    }
    getTokenHeaders(token) {
        if (!token)
            throw new JwtMissingError('Token not supplied to get headers');
        const headers = JSON.parse(atob(token.split('.')[0]));
        if (!headers)
            throw new Error("Invalid JWT header");
        return headers;
    }
    getTokenPayload(token) {
        if (!token)
            throw new JwtMissingError('Token not supplied to get payload');
        const data = JSON.parse(atob(token.split('.')[1]));
        if (!data)
            throw new Error("Invalid JWT payload");
        return {
            ...data
        };
    }
    getJwkByKidFromCache(kid) {
        const index = this.JWKs.findIndex((keySet) => keySet.kid == kid);
        if (index > -1) {
            return this.JWKs[index];
        }
        return undefined;
    }
    async fetchJwksByKid(kid) {
        if (!kid)
            throw new Error('kid missing.');
        const response = await fetch(`${this.config.apiUrl}/.well-known/jwks`, {
            headers: {
                'X-Tenant-Uuid': this.config.tenantUuid,
            }
        });
        if (!response.ok)
            throw new Error('Could not refresh jwks');
        const data = await response.json();
        const key = data.keys.find((keySet) => keySet.kid === kid);
        if (!key)
            throw new Error('Could not refresh jwks');
        this.JWKs.push(key);
    }
}
//# sourceMappingURL=verifier.js.map