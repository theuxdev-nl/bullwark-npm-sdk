import { AuthConfig, User } from "./types/types";
import { AuthState } from "./state/auth-state";
export declare class BullwarkSdk {
    readonly state: AuthState;
    private readonly config;
    private readonly jwtVerifier;
    private readonly apiClient;
    private permissionChecker;
    private jwtUtils;
    private refreshInterval?;
    private events;
    constructor(config: AuthConfig);
    private checkOnStartup;
    login(email: string, password: string): Promise<boolean>;
    refresh(suppliedRefreshToken?: string | undefined | null): Promise<boolean>;
    logout(token?: string | null): Promise<void>;
    get user(): User | undefined;
    get isAuthenticated(): boolean;
    get tokenExpiresIn(): number | 0;
    get tokenExpired(): boolean;
    get tokenStillValid(): boolean;
    get tokenAlmostExpired(): boolean;
    userCan(uuid: string): boolean;
    userCanKey(key: string): boolean;
    userHasRole(uuid: string): boolean;
    userHasRoleKey(key: string): boolean;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    private startRefreshInterval;
}
//# sourceMappingURL=auth.d.ts.map