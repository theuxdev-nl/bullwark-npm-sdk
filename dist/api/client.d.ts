import { LoginCredentials, AuthConfig, JwtResponse, User } from "../../types/types";
import { AuthState } from "../state/auth-state";
import { JWTVerifier } from "../jwt/verifier";
export declare class APIClient {
    private config;
    private state;
    private jwtVerifier;
    constructor(config: AuthConfig, state: AuthState, jwtVerifier: JWTVerifier);
    login(credentials: LoginCredentials): Promise<JwtResponse>;
    refreshToken(refreshToken?: string | null): Promise<JwtResponse>;
    logout(jwtToken?: string | null): Promise<void>;
    fetchUserDetails(token: string): Promise<User>;
}
//# sourceMappingURL=client.d.ts.map