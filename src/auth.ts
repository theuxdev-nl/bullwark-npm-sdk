import {JWTVerifier} from './jwt/verifier';
import {APIClient} from './api/client';
import {AbilityChecker} from './abilities/checker';
import {
    AuthConfig,
    UserData,
} from "./types/types";
import {AuthState} from "./state/auth-state";
import {CryptoError} from "./errors/errors";
import {EventEmitter} from "./events/emitter";

export class BullwarkSdk {

    public readonly state: AuthState;
    private readonly config: AuthConfig;
    private readonly jwtVerifier: JWTVerifier;
    private readonly apiClient: APIClient;
    private abilityChecker: AbilityChecker;
    private refreshInterval?: NodeJS.Timeout;
    private events = new EventEmitter();

    constructor(config: AuthConfig) {
        this.config = {
            apiUrl: 'https://api.bullwark.io/api/auth/v1',
            jwkUrl: 'https://api.bullwark.io/.well-known/jwks',
            devMode: false,
            useCookie: true,
            autoRefresh: true,
            autoRefreshBuffer: (60 * 2 * 1000),
            jwkCacheTime: (60 * 60 * 24 * 1000),
            userCacheTime: (60 * 60 * 1000),
            ...config
        };
        this.state = new AuthState(this.config);
        this.jwtVerifier = new JWTVerifier(this.config);
        this.apiClient = new APIClient(this.config, this.state);
        this.abilityChecker = new AbilityChecker(this.state);
        if (!this.jwtVerifier.isCryptoAvailable() && !this.config.devMode) {
            throw new CryptoError('Crypto.subtle for verifying JWT signature is unavailable! Bullwark will not work. Crypto.subtle only works on HTTPS and localhost domains.');
        } else if (!this.jwtVerifier.isCryptoAvailable()) {
            console.warn("Bullwark SDK: crypto.subtle not active. " +
                "Dev mode is enabled. JWT headers and payloads are unverified. " +
                "DO NOT TRUST THIS DATA ON PRODUCTION."
            );
        }

        this.checkOnStartup().then(() => {
            //
        });

    }


    /**
     * On first load of the SDK, check existing storage to see if there's a stored JWT (in storage) or a refreshToken is in place.
     * Tries to verify existing JWT, or tries to log in again using refresh token.
     * @private
     */
    private async checkOnStartup(): Promise<void> {
        const jwt = this.state.getJwt();
        if (jwt && jwt !== '' && jwt !== null) {
            if (
                !await this.jwtVerifier.isValid(jwt) ||
                this.jwtVerifier.isExpired(jwt)
            ) {
                if (this.config.devMode) {
                    if (!await this.jwtVerifier.isValid(jwt)) {
                        console.debug("Bullwark: Stored JWT token is invalid!");
                    } else {
                        console.debug("Bullwark: Stored JWT token has expired.");
                    }
                }

                this.state.invalidateSession().finishInitializing();
                return;
            }

            try {
                const user = await this.apiClient.fetchUser(jwt);
                this.state.setUser(user)
                    .setAuthenticated(true)
                    .finishInitializing();

                this.events.emit('userHydrated', {user});
                this.events.emit('bullwarkLoaded');
                await this.startRefreshInterval()
                return;
            } catch {
                if (this.config.devMode) {
                    console.debug("Bullwark: Unable to retrieve user details using existing JWT.");
                }
                this.state.invalidateSession().finishInitializing();
                return;
            }

        } else {
            try {
                // Attempt refresh flow
                const oldRefreshToken = this.config.useCookie ? undefined : this.state.getRefreshToken();

                const {jwt: rawJwt, refreshToken} = await this.apiClient.refresh(oldRefreshToken);
                const {jwt, header, payload} = this.jwtVerifier.dissectJwt(rawJwt);
                this.state.setJwt(jwt, header, payload);
                const userData: UserData = await this.apiClient.fetchUser(jwt);

                this.state.setUser(userData)
                    .setAuthenticated(true)
                    .finishInitializing();

                if (!this.config.useCookie && refreshToken) {
                    this.state.setRefreshToken(refreshToken);
                }

                this.events.emit('userHydrated', {userData});
                this.events.emit('bullwarkLoaded');

                await this.startRefreshInterval()
                return;
            } catch (err) {
                if (this.config.devMode) {
                    console.debug("Bullwark: Unable to use refreshToken to refresh JWT.");
                    console.debug(err);
                }
            }
        }

        if (this.config.devMode) {
            console.debug("Bullwark: No refresh token or existing JWT in place. Starting clean.")
        }
        this.state.finishInitializing();
    }

    /** Perform a login call to Bullwark. Returns 'true' if successful
     *
     * @param email
     * @param password
     */
    public async login(email: string, password: string): Promise<boolean> {
        this.state.invalidateSession(); // Clear any stale old state
        const {jwt: rawJwt, refreshToken} = await this.apiClient.login(email, password);
        if (this.jwtVerifier.isExpired(rawJwt)) throw new Error("Bullwark: JWT is expired already!")
        if (!await this.jwtVerifier.isValid(rawJwt)) throw new Error("Bullwark: JWT could not be verified. Possible security breach!")

        if (!this.config.useCookie && refreshToken) {
            this.state.setRefreshToken(refreshToken)
        }

        const {jwt, header, payload} = this.jwtVerifier.dissectJwt(rawJwt);
        const userData: UserData = await this.apiClient.fetchUser(jwt)

        this.state.setJwt(jwt, header, payload)
            .setUser(userData)
            .setAuthenticated(true)
            .finishInitializing();

        this.events.emit('userLoggedIn', {userData});
        await this.startRefreshInterval()
        return true;
    }

    public async refresh(suppliedRefreshToken: string | undefined | null = null): Promise<boolean> {
        const {jwt: rawJwt, refreshToken} = await this.apiClient.refresh(suppliedRefreshToken);

        if (this.jwtVerifier.isExpired(rawJwt)) throw new Error("Bullwark: new JWT is expired already!")
        if (!await this.jwtVerifier.isValid(rawJwt)) throw new Error("Bullwark: new JWT could not be verified. Possible security breach!")

        const {jwt, header, payload} = this.jwtVerifier.dissectJwt(rawJwt);
        this.state.setJwt(jwt, header, payload);
        if (!this.config.useCookie && refreshToken) {
            this.state.setRefreshToken(refreshToken)
        }

        let userData: UserData;
        const detailsChanged = this.state.getDetailsHashChanged();
        if (detailsChanged) {
            userData = await this.apiClient.fetchUser(jwt);
            this.state.setUser(userData);
        } else {
            userData = this.state.getUser() ?? await this.apiClient.fetchUser(jwt);
        }

        this.events.emit('userRefreshed', {userData});

        return true;
    }

    public async logout(token: string | null = null): Promise<boolean> {
        await this.apiClient.logout(token);
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
        }
        this.state.invalidateSession();
        this.events.emit('userLoggedOut');

        return true;
    }

    public async getIsInitialized(): Promise<boolean> {
        return this.state.getIsInitialized();
    }

    public getUserCachedAt(): number | undefined {
        return this.state.getUserCachedAt();
    }

    public getUser(): UserData | undefined {
        return this.state.getUser();
    }

    public getAuthenticated(): boolean {
        return this.state.getAuthenticated();
    }

    public getJwt(): string | undefined {
        return this.state.getJwt();
    }

    public getJwtExp(): number | undefined {
        return this.state.getJwtExp();
    }

    public getRefreshToken(): string | undefined {
        return this.state.getRefreshToken();
    }

    public getUserUuid(): string | undefined {
        return this.getUser()?.user.uuid;
    }

    public getTenantUuid(): string | undefined {
        return this.getUser()?.user.tenantUuid;
    }

    public getCustomerUuid(): string | undefined {
        return this.getUser()?.user.customerUuid;
    }

    public userCan(uuid: string): boolean {
        return this.abilityChecker.userCan(uuid);
    }

    public userCanKey(key: string): boolean {
        return this.abilityChecker.userCanKey(key);
    }

    public userHasRole(uuid: string): boolean {
        return this.abilityChecker.userHasRole(uuid);
    }

    public userHasRoleKey(key: string): boolean {
        return this.abilityChecker.userHasRoleKey(key);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    public on(event: string, callback: Function) {
        this.events.on(event, callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    public off(event: string, callback: Function) {
        this.events.off(event, callback);
    }

    private async startRefreshInterval() {
        if (!this.config.autoRefresh || this.refreshInterval) return;
        if (!this.state.getJwtExp() || !this.config.autoRefreshBuffer) return;

        this.refreshInterval = setInterval(() => {
            const expMs = (this.state.getJwtExp() ?? 0) * 1000;
            const bufferMs = this.config.autoRefreshBuffer ?? 0;
            if (expMs < (Date.now() + bufferMs)) {
                this.refresh().catch(console.error);
            }
        }, 30000);
    }

}
