import { AuthConfig } from "../types/types";
import { AuthState } from "../state/auth-state";
import { APIClient } from "../api/client";
export declare class JwtUtils {
    private config;
    private state;
    private apiClient;
    constructor(config: AuthConfig, state: AuthState, apiClient: APIClient);
    timeUntilExpiry(from?: number | null): number;
    isExpired(from?: number | null): boolean;
    isStillValid(from?: number | null): boolean;
    isNearlyExpired(from?: number | null): boolean;
}
//# sourceMappingURL=jwtUtils.d.ts.map