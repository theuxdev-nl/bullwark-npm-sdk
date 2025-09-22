import { jwtVerify } from "jose";
export class JWTVerifier {
    constructor(config, state) {
        this.config = config;
        this.JWKs = [];
    }
    isCryptoAvailable() {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }
    async getVerifiedTokenPayload(token) {
        let headers = JSON.parse(atob(token.split('.')[0]));
        let payload = JSON.parse(atob(token.split('.')[1]));
        if (this.isCryptoAvailable()) {
            let jwk = this.getJwkById(headers.kid);
            if (!jwk)
                await this.refreshJwkById(headers.kid);
            jwk = this.getJwkById(headers.kid);
            if (!jwk)
                throw new Error('Could not verify payload: jwk missing');
            const { payload: verifiedPayload, protectedHeader: verifiedHeaders } = await jwtVerify(token, jwk, {
                audience: 'fe',
                issuer: 'paulauth'
            });
            headers = verifiedHeaders;
            payload = verifiedPayload;
        }
        return {
            jwtToken: token,
            payload: payload,
            headers: headers,
        };
    }
    getJwkById(kid) {
        const index = this.JWKs.findIndex((keySet) => keySet.kid == kid);
        if (index > -1) {
            return this.JWKs[index];
        }
        return undefined;
    }
    async refreshJwkById(kid) {
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