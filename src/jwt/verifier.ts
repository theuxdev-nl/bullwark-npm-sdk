// @ts-ignore
import {AuthConfig, Jwkey, VerifiedJwt} from "../../types/types";
import {AuthState} from "../state/auth-state";
import {jwtVerify} from "jose";

export class JWTVerifier {
    constructor(private config: AuthConfig, state: AuthState) {}
    private JWKs: Jwkey[] = [];

    isCryptoAvailable(): boolean {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }

    public async getVerifiedTokenPayload(token: string): Promise<VerifiedJwt> {
        let headers = JSON.parse(atob(token.split('.')[0]));
        let payload = JSON.parse(atob(token.split('.')[1]));
        if (this.isCryptoAvailable()) {
            let jwk: Jwkey | undefined = this.getJwkById(headers.kid);
            if (!jwk) await this.refreshJwkById(headers.kid);

            jwk = this.getJwkById(headers.kid);
            if(!jwk) throw new Error('Could not verify payload: jwk missing');
            const {payload: verifiedPayload, protectedHeader: verifiedHeaders} = await jwtVerify(token, jwk, {
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
        }
    }

    private getJwkById(kid: string): Jwkey|undefined {
        const index = this.JWKs.findIndex((keySet: any) => keySet.kid == kid);
        if (index > -1) {
            return this.JWKs[index];
        }
        return undefined;
    }

    private async refreshJwkById(kid: string): Promise<void> {
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