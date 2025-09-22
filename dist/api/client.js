export class APIClient {
    constructor(config, state, jwtVerifier) {
        this.config = config;
        this.state = state;
        this.jwtVerifier = jwtVerifier;
    }
    async login(credentials) {
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
    async refreshToken(refreshToken = null) {
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
        });
        if (!response.ok)
            throw new Error('Could not refresh token');
        const data = await response.json();
        this.state.detailsHash !== data.detailsHash ? await this.fetchUserDetails(data.token) : null; // Hash changed, refetch user details, roles and permissions;
        return {
            jwtToken: data.token,
            refreshToken: this.config.useCookie ? null : data.refreshToken,
        };
    }
    async logout(jwtToken = null) {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${jwtToken ?? this.state.storedJwtToken}`
            }
        });
        if (!response.ok)
            throw new Error("Could not logout");
    }
    async fetchUserDetails(token) {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/me`, {
            headers: {
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok)
            throw new Error('Could not fetch user details');
        return await response.json();
    }
}
//# sourceMappingURL=client.js.map