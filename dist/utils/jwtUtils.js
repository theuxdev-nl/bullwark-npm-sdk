import * as storageModule from "local-storage-fallback";
const storage = storageModule.default || storageModule;
export class JwtUtils {
    constructor(config, state, apiClient) {
        this.config = config;
        this.state = state;
        this.apiClient = apiClient;
    }
    timeUntilExpiry(from = null) {
        if (from === null) {
            from = Date.now();
        }
        const expiresIn = (this.state.jwtTokenExpiresAt * 1000) - from;
        if (expiresIn < 0) {
            return 0;
        }
        return expiresIn;
    }
    isExpired(from = null) {
        return this.timeUntilExpiry(from) === 0;
    }
    isStillValid(from = null) {
        return !this.isExpired(from);
    }
    isNearlyExpired(from = null) {
        return this.timeUntilExpiry(from) < 5 * 60 * 1000; // 5 minutes
    }
}
//# sourceMappingURL=jwtUtils.js.map