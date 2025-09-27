import { AuthConfig, User } from "../types/types";
import { APIClient } from "../api/client";
import { JWTVerifier } from "../jwt/verifier";
export declare class AuthState {
    initialized: boolean;
    user: User | undefined;
    isAuthenticated: boolean;
    storedJwtToken: string | null | undefined;
    storedRefreshToken: string | undefined;
    jwtTokenExpiresAt: number | undefined;
    detailsHash: string | null | undefined;
    apiClient: APIClient;
    config: AuthConfig;
    jwtVerifier: JWTVerifier;
    constructor(config: AuthConfig);
    finishInitialing(): void;
    invalidate(): void;
}
//# sourceMappingURL=auth-state.d.ts.map