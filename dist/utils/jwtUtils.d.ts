import { AuthConfig } from "../../types/types";
import { AuthState } from "../state/auth-state";
export declare class JwtUtils {
    private config;
    private state;
    constructor(config: AuthConfig, state: AuthState);
    timeUntilExpiry(from?: number | null): number;
    isExpired(from?: number | null): boolean;
    isStillValid(from?: number | null): boolean;
    isNearlyExpired(from?: number | null): boolean;
}
//# sourceMappingURL=jwtUtils.d.ts.map