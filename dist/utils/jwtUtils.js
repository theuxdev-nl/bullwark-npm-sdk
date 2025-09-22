export class JwtUtils {
    constructor(config, state) {
        this.config = config;
        this.state = state;
    }
    timeUntilExpiry(from = null) {
        if (from === null) {
            from = Date.now();
        }
        const expiresIn = from - this.state.jwtTokenExpiresAt;
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