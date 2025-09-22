import { AuthConfig, User, VerifiedJwt } from "../../types/types";
export declare class AuthState {
    private config;
    constructor(config: AuthConfig);
    user: User | undefined;
    isAuthenticated: boolean;
    storedJwtToken: string | undefined;
    storedRefreshToken: string | undefined;
    jwtTokenExpiresAt: number | undefined;
    detailsHash: string | undefined;
    setData(verifiedJwt: VerifiedJwt, refreshToken?: string): void;
    setUser(user: User): void;
    invalidate(): void;
}
//# sourceMappingURL=auth-state.d.ts.map