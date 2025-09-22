export class AuthState {
    constructor(config) {
        this.config = config;
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
    }
    setData(verifiedJwt, refreshToken) {
        this.storedJwtToken = verifiedJwt.jwtToken;
        this.jwtTokenExpiresAt = verifiedJwt.payload.exp;
        this.detailsHash = verifiedJwt.payload.detailsHash;
        this.storedRefreshToken = this.config.useCookie ? refreshToken : undefined;
    }
    setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
    }
    invalidate() {
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
        this.isAuthenticated = false;
    }
}
//# sourceMappingURL=auth-state.js.map