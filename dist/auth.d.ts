import { AuthConfig, UserData } from "./types/types";
import { AuthState } from "./state/auth-state";
export declare class BullwarkSdk {
    readonly state: AuthState;
    private readonly config;
    private readonly jwtVerifier;
    private readonly apiClient;
    private abilityChecker;
    private refreshInterval?;
    private events;
    constructor(config: AuthConfig);
    /**
     * On first load of the SDK, check existing storage to see if there's a stored JWT (in storage) or a refreshToken is in place.
     * Tries to verify existing JWT, or tries to log in again using refresh token.
     * @private
     */
    private checkOnStartup;
    /** Perform a login call to Bullwark. Returns 'true' if successful
     *
     * @param email
     * @param password
     */
    login(email: string, password: string): Promise<boolean>;
    refresh(suppliedRefreshToken?: string | undefined | null): Promise<boolean>;
    logout(token?: string | null): Promise<boolean>;
    getIsInitialized(): Promise<boolean>;
    getUserCachedAt(): number | undefined;
    getUser(): UserData | undefined;
    getAuthenticated(): boolean;
    getJwt(): string | undefined;
    getJwtExp(): number | undefined;
    getRefreshToken(): string | undefined;
    getUserUuid(): string | undefined;
    getTenantUuid(): string | undefined;
    getCustomerUuid(): string | undefined;
    userCan(uuid: string): boolean;
    userCanKey(key: string): boolean;
    userHasRole(uuid: string): boolean;
    userHasRoleKey(key: string): boolean;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    private startRefreshInterval;
    setCustomerUuid(uid: string): void;
    setTenantUuid(uid: string): void;
}
//# sourceMappingURL=auth.d.ts.map