import { AuthConfig, UserData } from "../types/types";
import { AuthState } from "../state/auth-state";
export declare class APIClient {
    private config;
    private state;
    constructor(config: AuthConfig, state: AuthState);
    login(email: string, password: string): Promise<{
        jwt: string;
        refreshToken: string | null | undefined;
    }>;
    refresh(suppliedRefreshToken?: string | undefined | null): Promise<{
        jwt: string;
        refreshToken: string | null | undefined;
    }>;
    logout(suppliedJwt?: string | null): Promise<void>;
    fetchUser(jwt: string): Promise<UserData>;
}
//# sourceMappingURL=client.d.ts.map