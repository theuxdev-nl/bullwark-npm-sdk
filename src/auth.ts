import {JWTVerifier} from './jwt/verifier';
import {APIClient} from './api/client';
import {AbilityChecker} from './abilities/checker';
import {
    AuthConfig,
    User,
} from "./types/types";
import {AuthState} from "./state/auth-state";
import {JwtUtils} from "./utils/jwtUtils";
import storage from 'local-storage-fallback'
import {CryptoError} from "./errors/errors";
import {EventEmitter} from "./events/emitter";

export class BullwarkSdk {

    public readonly state: AuthState;
    private readonly config: AuthConfig;
    private readonly jwtVerifier: JWTVerifier;
    private readonly apiClient: APIClient;
    private permissionChecker: AbilityChecker;
    private jwtUtils: JwtUtils;
    private refreshInterval?: NodeJS.Timeout;
    private events = new EventEmitter();

    constructor(config: AuthConfig) {
        this.config = {
            devMode: false,
            useLocalStorage: true,
            useCookie: true,
            autoRefresh: true,
            autoRefreshBuffer: (60 * 2 * 1000), ...config
        };
        this.state = new AuthState(this.config);
        this.jwtVerifier = new JWTVerifier(this.config);
        this.apiClient = new APIClient(this.config, this.state);
        this.permissionChecker = new AbilityChecker(this.config, this.state);
        this.jwtUtils = new JwtUtils(this.config, this.state, this.apiClient);
        if (!this.jwtVerifier.isCryptoAvailable() && !this.config.devMode) {
            throw new CryptoError('Crypto.subtle for verifying JWT signature is unavailable! Bullwark will not work. Crypto.subtle only works on HTTPS and localhost domains.');
        } else if (!this.jwtVerifier.isCryptoAvailable()) {
            console.warn("Bullwark SDK: crypto.subtle not active. " +
                "Dev mode is enabled. JWT headers and payloads are unverified. " +
                "DO NOT TRUST THIS DATA ON PRODUCTION."
            );
        }

        this.checkOnStartup();

    }

    private async checkOnStartup(): Promise<void> {
        const token = storage.getItem('bullwark:jwt');
        if (token && token !== '' && token !== null) {
            if(
                !await this.jwtVerifier.isValid(token) ||
                this.jwtVerifier.isExpired(token)
            ){
                // Fail fast
                this.state.invalidate();
                this.state.finishInitialing();
                return;
            }

            try{
                this.state.user = await this.apiClient.fetchUser(token);
                this.events.emit('userHydrated', { user: this.state.user });
            } catch {
                // Silently fail
                this.state.invalidate();
                return;
            }

            this.state.finishInitialing();
            await this.startRefreshInterval()
            return;

        } else {
            try {
                const {jwt, refreshToken} = await this.apiClient.refresh();
                storage.setItem('bullwark:jwt', jwt);
                if(refreshToken){
                    storage.setItem('bullwark:refreshToken', refreshToken);
                }

                this.state.user = await this.apiClient.fetchUser(jwt);
                this.events.emit('userHydrated', { user: this.state.user });
                this.state.finishInitialing();
                await this.startRefreshInterval()

                return;
            } catch {
                // Silently fail
            }
        }

        this.state.finishInitialing();
    }

    public async login(email: string, password: string): Promise<boolean> {
        this.state.invalidate(); // Clear any stale old state
        const {jwt, refreshToken} = await this.apiClient.login(email, password);
        if(await this.jwtVerifier.isValid(jwt) && !this.jwtVerifier.isExpired(jwt)) {
            storage.setItem('bullwark:jwt', jwt);
            if(!this.config.useCookie && refreshToken){
                storage.setItem('bullwark:refreshToken', refreshToken);
            }

            this.state.user = await this.apiClient.fetchUser(jwt);
            this.events.emit('userLoggedIn', { user: this.state.user });
            await this.startRefreshInterval()
            return true;
        }
        return false;
    }

    public async refresh(suppliedRefreshToken: string|undefined|null = null): Promise<boolean> {
        const {jwt, refreshToken} = await this.apiClient.refresh(suppliedRefreshToken);
        if(await this.jwtVerifier.isValid(jwt) && !this.jwtVerifier.isExpired(jwt)) {
            storage.setItem('bullwark:jwt', jwt);
            if(!this.config.useCookie && refreshToken){
                storage.setItem('bullwark:refreshToken', refreshToken);
            }

            this.state.user = await this.apiClient.fetchUser(jwt);
            this.events.emit('userRefreshed', { user: this.state.user });
            return true;
        }
        return false;
    }

    public async logout(token: string | null = null): Promise<void> {
        await this.apiClient.logout(token);
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
        }
        this.events.emit('userLoggedOut');
        this.state.invalidate();
    }

    public get user(): User | undefined {
        return this.state.user;
    }

    public get isAuthenticated(): boolean {
        return this.state.isAuthenticated;
    }

    public get tokenExpiresIn(): number | 0 {
        return this.jwtUtils.timeUntilExpiry()
    }

    public get tokenExpired(): boolean {
        return this.jwtUtils.isExpired()
    }

    public get tokenStillValid(): boolean {
        return this.jwtUtils.isStillValid()
    }

    public get tokenAlmostExpired(): boolean {
        const exp = storage.getItem('bullwark:jwt-exp');
        if (!exp) return false;
        const timeLeft = (Number(exp) * 1000) - Date.now();
        return timeLeft < (this.config.autoRefreshBuffer ?? (2 * 60 * 1000));
    }

    public userCan(uuid: string): boolean {
        return this.permissionChecker.userCan(uuid);
    }

    public userCanKey(key: string): boolean {
        return this.permissionChecker.userCanKey(key);
    }

    public userHasRole(uuid: string): boolean {
        return this.permissionChecker.userHasRole(uuid);
    }

    public userHasRoleKey(key: string): boolean {
        return this.permissionChecker.userHasRoleKey(key);
    }

    public on(event: string, callback: Function) {
        this.events.on(event, callback);
    }

    public off(event: string, callback: Function) {
        this.events.off(event, callback);
    }

    private async startRefreshInterval() {
        if (!this.config.autoRefresh || this.refreshInterval) return;

        this.refreshInterval = setInterval(() => {
            if (this.tokenAlmostExpired && !this.tokenExpired) {
                this.refresh().catch(console.error);
            }
        }, 30000);
    }

}
