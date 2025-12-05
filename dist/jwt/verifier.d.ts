import { AuthConfig } from "../types/types";
import { JWTHeaderParameters, JWTPayload } from "jose";
export declare class JWTVerifier {
    private config;
    constructor(config: AuthConfig);
    private JWKs;
    isCryptoAvailable(): boolean;
    checkJwtValid(token: string): Promise<void>;
    isExpired(token: string): boolean;
    private getJwkByKidFromCache;
    private fetchJwksByKid;
    dissectJwt(jwt: string): {
        jwt: string;
        header: JWTHeaderParameters;
        payload: JWTPayload;
    };
    private getTokenHeaders;
    getTokenPayload(token: string): JWTPayload;
}
//# sourceMappingURL=verifier.d.ts.map