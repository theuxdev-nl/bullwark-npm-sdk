import { AuthConfig, VerifiedJwt } from "../../types/types";
import { AuthState } from "../state/auth-state";
export declare class JWTVerifier {
    private config;
    constructor(config: AuthConfig, state: AuthState);
    private JWKs;
    isCryptoAvailable(): boolean;
    getVerifiedTokenPayload(token: string): Promise<VerifiedJwt>;
    private getJwkById;
    private refreshJwkById;
}
//# sourceMappingURL=verifier.d.ts.map