import { ConnectionError, ConnectionIncorrectResponseError, InvalidInputError } from "../errors/errors";
export class APIClient {
    constructor(config, state) {
        this.config = config;
        this.state = state;
    }
    async login(email, password) {
        if (!email) {
            throw new InvalidInputError('Email missing!');
        }
        if (!password) {
            throw new InvalidInputError('Password missing!');
        }
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/login${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'X-Customer-Uuid': this.config.customerUuid,
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
            credentials: this.config.useCookie ? 'include' : 'omit',
        });
        if (!response.ok)
            throw new ConnectionError("Couldn't connect to Bullwark - please try again later.");
        const data = await response.json();
        if (!data)
            throw new ConnectionIncorrectResponseError("Incorrect response from Bullwark");
        return {
            jwt: data.token,
            refreshToken: data.refreshToken,
        };
    }
    async refresh(suppliedRefreshToken = undefined) {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/refresh${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'X-Customer-Uuid': this.config.customerUuid,
                ...(suppliedRefreshToken && { 'X-Refresh-Token': suppliedRefreshToken })
            },
            credentials: this.config.useCookie ? 'include' : 'omit',
        });
        if (!response.ok)
            throw new ConnectionError("Couldn't connect to Bullwark - please try again later.");
        const data = await response.json();
        if (!data)
            throw new ConnectionIncorrectResponseError("Incorrect response from Bullwark");
        return {
            jwt: data.token,
            refreshToken: data.refreshToken,
        };
    }
    async logout(suppliedJwt = null) {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${suppliedJwt ?? this.state.storedJwtToken}`
            }
        });
        if (!response.ok)
            throw new Error("Could not logout");
    }
    async fetchUser(token) {
        const response = await fetch(`${this.config.apiUrl}/api/auth/v1/me`, {
            headers: {
                'X-Customer-Uuid': this.config.customerUuid,
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok)
            throw new ConnectionError('Could not fetch user details');
        const data = await response.json();
        if (!data)
            throw new ConnectionError("Could not fetch user details");
        return data;
    }
}
//# sourceMappingURL=client.js.map