import {AuthConfig} from "../../types/types";
import {AuthState} from "../state/auth-state";

export class JwtUtils {
    constructor(private config: AuthConfig, private state: AuthState) { }
    timeUntilExpiry(from: number|null = null) {
        if (from === null) {
            from = Date.now();
        }
        const expiresIn = from - this.state.jwtTokenExpiresAt!;
        if(expiresIn < 0){
            return 0;
        }
        return expiresIn;
    }

    isExpired (from: number|null = null) {
        return this.timeUntilExpiry(from) === 0;
    }

    isStillValid (from: number|null = null) {
        return !this.isExpired(from);
    }

    isNearlyExpired (from: number|null = null) {
        return this.timeUntilExpiry(from) < 5 * 60 * 1000; // 5 minutes
    }
}