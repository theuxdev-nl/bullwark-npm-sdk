import storage from "local-storage-fallback";
import { APIClient } from "../api/client";
import { JWTVerifier } from "../jwt/verifier";
export class AuthState {
    constructor(config) {
        this.initialized = false;
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
        this.config = config;
        this.jwtVerifier = new JWTVerifier(this.config);
        const existingJwt = storage.getItem('bullwark:jwt');
        const existingExp = storage.getItem('bullwark:jwt-exp');
        const existingRefresh = config.useCookie ? undefined : storage.getItem('bullwark:refresh');
        this.apiClient = new APIClient(this.config, this);
        if (existingJwt) {
            this.storedJwtToken = existingJwt;
        }
        if (existingExp) {
            this.jwtTokenExpiresAt = Number(existingExp);
        }
        if (existingRefresh) {
            this.storedRefreshToken = existingRefresh;
        }
    }
    finishInitialing() {
        this.initialized = true;
    }
    invalidate() {
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
        this.isAuthenticated = false;
        storage.removeItem('bullwark:jwt');
        storage.removeItem('bullwark:jwt-exp');
    }
}
//# sourceMappingURL=auth-state.js.map