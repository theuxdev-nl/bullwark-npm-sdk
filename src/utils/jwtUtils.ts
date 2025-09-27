import {AuthConfig} from "../types/types";
import {AuthState} from "../state/auth-state";
import storage from "local-storage-fallback";
import {APIClient} from "../api/client";
import {JwtMissingError} from "../errors/errors";

export class JwtUtils {
    private config: AuthConfig;
    private state: AuthState;
    private apiClient: APIClient;

    constructor(config: AuthConfig, state: AuthState, apiClient: APIClient) {
        this.config = config;
        this.state = state;
        this.apiClient = apiClient;
    }

    timeUntilExpiry(from: number|null = null) {
        if (from === null) {
            from = Date.now();
        }
        const expiresIn = (this.state.jwtTokenExpiresAt! * 1000) - from;
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