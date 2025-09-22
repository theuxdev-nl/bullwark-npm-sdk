import { AuthConfig, LoginCredentials, User } from "../types/types";
export declare class BullwarkSDK {
    private readonly config;
    private readonly state;
    private readonly jwtVerifier;
    private apiClient;
    private permissionChecker;
    private jwtUtils;
    constructor(config: AuthConfig);
    login(credentials: LoginCredentials): Promise<void>;
    refresh(refreshToken?: string | null): Promise<void>;
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
}
//# sourceMappingURL=auth.d.ts.map