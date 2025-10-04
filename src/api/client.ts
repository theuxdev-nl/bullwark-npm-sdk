import {AuthConfig, UserData} from "../types/types";
import {AuthState} from "../state/auth-state";
import {ConnectionError, ConnectionIncorrectResponseError, InvalidInputError} from "../errors/errors";


export class APIClient {

    constructor(private config: AuthConfig, private state: AuthState) {}

    public async login(email: string, password: string): Promise<{jwt: string, refreshToken: string|null|undefined}> {
        if(!email) {
            throw new InvalidInputError('Email missing!')
        }
        if(!password) {
            throw new InvalidInputError('Password missing!')
        }

        const response = await fetch(`${this.config.apiUrl}/login${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
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

        if (!response.ok) throw new ConnectionError("Couldn't connect to Bullwark - please try again later.")
        const data = await response.json();
        if(!data) throw new ConnectionIncorrectResponseError("Incorrect response from Bullwark");

        return {
            jwt: data.token,
            refreshToken: data.refreshToken,
        }
    }

    public async refresh(suppliedRefreshToken: string|undefined|null = undefined): Promise<{jwt: string, refreshToken: string|null|undefined}> {
        const response = await fetch(`${this.config.apiUrl}/refresh${this.config.useCookie ? '' : '?plainRefresh=true'}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'X-Customer-Uuid': this.config.customerUuid,
                ...(suppliedRefreshToken && { 'X-Refresh-Token': suppliedRefreshToken })
            },
            credentials: this.config.useCookie ? 'include' : 'omit',
        })

        if (!response.ok) throw new ConnectionError("Couldn't connect to Bullwark - please try again later.")
        const data = await response.json();
        if(!data) throw new ConnectionIncorrectResponseError("Incorrect response from Bullwark");

        return {
            jwt: data.token,
            refreshToken: data.refreshToken,
        }
    }

    public async logout(suppliedJwt: string|null = null): Promise<void> {
        const response = await fetch(`${this.config.apiUrl}/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${suppliedJwt ?? this.state.getJwt()}`
            }
        })

        if (!response.ok) throw new Error("Could not logout");
    }

    public async fetchUser(jwt: string) : Promise<UserData> {
        const response = await fetch(`${this.config.apiUrl}/me`, {
            headers: {
                'X-Customer-Uuid': this.config.customerUuid,
                'X-Tenant-Uuid': this.config.tenantUuid,
                'Authorization': `Bearer ${jwt}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new ConnectionError('Could not fetch user details');
        const data = await response.json();
        if(!data) throw new ConnectionError("Could not fetch user details");
        return data;
    }

}