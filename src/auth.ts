import { JWTVerifier } from './jwt/verifier';
import { APIClient } from './api/client';
import { AbilityChecker } from './abilities/checker';
import {AuthConfig, LoginCredentials, User} from "../types/types";
import {AuthState} from "./state/auth-state";
import {JwtUtils} from "./utils/jwtUtils";

export class BullwarkSDK {
    private readonly config: AuthConfig;
    private readonly state: AuthState;
    private readonly jwtVerifier: JWTVerifier;
    private apiClient: APIClient;
    private permissionChecker: AbilityChecker;
    private jwtUtils: JwtUtils;

    constructor(config: AuthConfig) {
        this.config = { useCookie: true, ...config };
        this.state = new AuthState(this.config);
        this.jwtVerifier = new JWTVerifier(this.config, this.state);
        this.apiClient = new APIClient(this.config, this.state, this.jwtVerifier);
        this.permissionChecker = new AbilityChecker(this.config, this.state);
        this.jwtUtils = new JwtUtils(this.config, this.state);
        if(!this.jwtVerifier.isCryptoAvailable()){
            console.warn("Bullwark SDK: crypto.subtle not active. " +
                "This is expected on local / testing environments. JWT headers and payloads are unverified. " +
                "DO NOT TRUST THIS DATA ON PRODUCTION.");
        }
    }

    async login(credentials: LoginCredentials) {
        const response = await this.apiClient.login(credentials);
        const verifiedPayloadData = await this.jwtVerifier.getVerifiedTokenPayload(response.jwtToken);
        this.state.setData(verifiedPayloadData, response.refreshToken ?? undefined);
        this.state.setUser(await this.apiClient.fetchUserDetails(response.jwtToken));
    }
    async refresh(refreshToken: string|null = null): Promise<void> {
        const response = await this.apiClient.refreshToken(refreshToken);
        const verifiedPayloadData = await this.jwtVerifier.getVerifiedTokenPayload(response.jwtToken);
        this.state.setData(verifiedPayloadData, refreshToken ?? undefined);
        if(this.state.detailsHash !== verifiedPayloadData.payload.detailsHash){
            this.state.setUser(await this.apiClient.fetchUserDetails(response.jwtToken));
        }
    }
    async logout(token: string|null = null): Promise<void> {
        await this.apiClient.logout(token);
        this.state.invalidate();
    }

    get user(): User|undefined { return this.state.user; }
    get isAuthenticated(): boolean { return this.state.isAuthenticated; }
    get tokenExpiresIn(): number|0 { return this.jwtUtils.timeUntilExpiry() }
    get tokenExpired(): boolean { return this.jwtUtils.isExpired() }
    get tokenStillValid(): boolean { return this.jwtUtils.isStillValid() }
    get tokenAlmostExpired(): boolean { return this.jwtUtils.isNearlyExpired() }

    userCan(uuid: string): boolean {return this.permissionChecker.userCan(uuid); }
    userCanKey(key: string): boolean {return this.permissionChecker.userCanKey(key); }

    userHasRole(uuid: string): boolean {return this.permissionChecker.userHasRole(uuid); }
    userHasRoleKey(key: string): boolean {return this.permissionChecker.userHasRoleKey(key); }

}
