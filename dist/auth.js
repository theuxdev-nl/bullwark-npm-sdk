import { JWTVerifier } from './jwt/verifier';
import { APIClient } from './api/client';
import { AbilityChecker } from './abilities/checker';
import { AuthState } from "./state/auth-state";
import { JwtUtils } from "./utils/jwtUtils";
export class BullwarkSDK {
    constructor(config) {
        this.config = { useCookie: true, ...config };
        this.state = new AuthState(this.config);
        this.jwtVerifier = new JWTVerifier(this.config, this.state);
        this.apiClient = new APIClient(this.config, this.state, this.jwtVerifier);
        this.permissionChecker = new AbilityChecker(this.config, this.state);
        this.jwtUtils = new JwtUtils(this.config, this.state);
        if (!this.jwtVerifier.isCryptoAvailable()) {
            console.warn("Bullwark SDK: crypto.subtle not active. " +
                "This is expected on local / testing environments. JWT headers and payloads are unverified. " +
                "DO NOT TRUST THIS DATA ON PRODUCTION.");
        }
    }
    async login(credentials) {
        const response = await this.apiClient.login(credentials);
        const verifiedPayloadData = await this.jwtVerifier.getVerifiedTokenPayload(response.jwtToken);
        this.state.setData(verifiedPayloadData, response.refreshToken ?? undefined);
        this.state.setUser(await this.apiClient.fetchUserDetails(response.jwtToken));
    }
    async refresh(refreshToken = null) {
        const response = await this.apiClient.refreshToken(refreshToken);
        const verifiedPayloadData = await this.jwtVerifier.getVerifiedTokenPayload(response.jwtToken);
        this.state.setData(verifiedPayloadData, refreshToken ?? undefined);
        if (this.state.detailsHash !== verifiedPayloadData.payload.detailsHash) {
            this.state.setUser(await this.apiClient.fetchUserDetails(response.jwtToken));
        }
    }
    async logout(token = null) {
        await this.apiClient.logout(token);
        this.state.invalidate();
    }
    get user() { return this.state.user; }
    get isAuthenticated() { return this.state.isAuthenticated; }
    get tokenExpiresIn() { return this.jwtUtils.timeUntilExpiry(); }
    get tokenExpired() { return this.jwtUtils.isExpired(); }
    get tokenStillValid() { return this.jwtUtils.isStillValid(); }
    get tokenAlmostExpired() { return this.jwtUtils.isNearlyExpired(); }
    userCan(uuid) { return this.permissionChecker.userCan(uuid); }
    userCanKey(key) { return this.permissionChecker.userCanKey(key); }
    userHasRole(uuid) { return this.permissionChecker.userHasRole(uuid); }
    userHasRoleKey(key) { return this.permissionChecker.userHasRoleKey(key); }
}
//# sourceMappingURL=auth.js.map