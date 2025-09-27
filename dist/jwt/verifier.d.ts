import { AuthConfig, JwtPayload } from "../types/types";
export declare class JWTVerifier {
    private config;
    constructor(config: AuthConfig);
    private JWKs;
    isCryptoAvailable(): boolean;
    isValid(token: string): Promise<boolean>;
    isExpired(token: string): boolean;
    private getTokenHeaders;
    getTokenPayload(token: string): JwtPayload;
    private getJwkByKidFromCache;
    private fetchJwksByKid;
}
//# sourceMappingURL=verifier.d.ts.map