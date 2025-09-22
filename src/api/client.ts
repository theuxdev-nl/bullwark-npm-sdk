import {LoginCredentials, AuthConfig, JwtResponse, AuthResponse, User} from "../../types/types";
import {AuthState} from "../state/auth-state";
import {JWTVerifier} from "../jwt/verifier";
import {jwtVerify} from "jose";

export class APIClient {
    constructor(private config: AuthConfig, private state: AuthState, private jwtVerifier: JWTVerifier) {}

    async login(credentials: LoginCredentials): Promise<JwtResponse> {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/login${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid
            },
            body: JSON.stringify(credentials),
            credentials: this.config.useCookie ? 'include' : 'omit',
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        return {
            jwtToken: data.token,
            refreshToken: data.refreshToken ?? null,
        };
    }

    async refreshToken(refreshToken: string|null = null): Promise<JwtResponse> {
        const tokenToUse = refreshToken ?? this.state.storedRefreshToken;
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/refresh${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                ...(tokenToUse && { 'X-Refresh-Token': tokenToUse })
            },
            credentials: this.config.useCookie ? 'include' : 'omit',
        })

        if (!response.ok) throw new Error('Could not refresh token');

        const data = await response.json();
        this.state.detailsHash !== data.detailsHash ? await this.fetchUserDetails(data.token) : null // Hash changed, refetch user details, roles and permissions;

        return {
            jwtToken: data.token,
            refreshToken: this.config.useCookie ? null : data.refreshToken,
        }

    }

    async logout(jwtToken: string|null = null): Promise<void> {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${jwtToken ?? this.state.storedJwtToken}`
            }
        })

        if (!response.ok) throw new Error("Could not logout");
    }

    async fetchUserDetails(token: string) : Promise<User> {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/me`, {
            headers: {
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Could not fetch user details');
        return await response.json();

    }


}