import { JWTVerifier } from './jwt/verifier';
import { APIClient } from './api/client';
import { AbilityChecker } from './abilities/checker';
import { AuthState } from "./state/auth-state";
import { JwtUtils } from "./utils/jwtUtils";
import storage from 'local-storage-fallback';
import { CryptoError } from "./errors/errors";
import { EventEmitter } from "./events/emitter";
export class BullwarkSdk {
    constructor(config) {
        this.events = new EventEmitter();
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
        }
        else if (!this.jwtVerifier.isCryptoAvailable()) {
            console.warn("Bullwark SDK: crypto.subtle not active. " +
                "Dev mode is enabled. JWT headers and payloads are unverified. " +
                "DO NOT TRUST THIS DATA ON PRODUCTION.");
        }
        this.checkOnStartup();
    }
    async checkOnStartup() {
        const token = storage.getItem('bullwark:jwt');
        if (token && token !== '' && token !== null) {
            if (!await this.jwtVerifier.isValid(token) ||
                this.jwtVerifier.isExpired(token)) {
                // Fail fast
                this.state.invalidate();
                this.state.finishInitialing();
                return;
            }
            try {
                this.state.user = await this.apiClient.fetchUser(token);
                this.events.emit('userHydrated', { user: this.state.user });
            }
            catch {
                // Silently fail
                this.state.invalidate();
                return;
            }
            this.state.finishInitialing();
            await this.startRefreshInterval();
            return;
        }
        else {
            try {
                const { jwt, refreshToken } = await this.apiClient.refresh();
                storage.setItem('bullwark:jwt', jwt);
                if (refreshToken) {
                    storage.setItem('bullwark:refreshToken', refreshToken);
                }
                this.state.user = await this.apiClient.fetchUser(jwt);
                this.events.emit('userHydrated', { user: this.state.user });
                this.state.finishInitialing();
                await this.startRefreshInterval();
                return;
            }
            catch {
                // Silently fail
            }
        }
        this.state.finishInitialing();
    }
    async login(email, password) {
        this.state.invalidate(); // Clear any stale old state
        const { jwt, refreshToken } = await this.apiClient.login(email, password);
        if (await this.jwtVerifier.isValid(jwt) && !this.jwtVerifier.isExpired(jwt)) {
            storage.setItem('bullwark:jwt', jwt);
            if (!this.config.useCookie && refreshToken) {
                storage.setItem('bullwark:refreshToken', refreshToken);
            }
            this.state.user = await this.apiClient.fetchUser(jwt);
            this.events.emit('userLoggedIn', { user: this.state.user });
            await this.startRefreshInterval();
            return true;
        }
        return false;
    }
    async refresh(suppliedRefreshToken = null) {
        const { jwt, refreshToken } = await this.apiClient.refresh(suppliedRefreshToken);
        if (await this.jwtVerifier.isValid(jwt) && !this.jwtVerifier.isExpired(jwt)) {
            storage.setItem('bullwark:jwt', jwt);
            if (!this.config.useCookie && refreshToken) {
                storage.setItem('bullwark:refreshToken', refreshToken);
            }
            this.state.user = await this.apiClient.fetchUser(jwt);
            this.events.emit('userRefreshed', { user: this.state.user });
            return true;
        }
        return false;
    }
    async logout(token = null) {
        await this.apiClient.logout(token);
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
        }
        this.events.emit('userLoggedOut');
        this.state.invalidate();
    }
    get user() {
        return this.state.user;
    }
    get isAuthenticated() {
        return this.state.isAuthenticated;
    }
    get tokenExpiresIn() {
        return this.jwtUtils.timeUntilExpiry();
    }
    get tokenExpired() {
        return this.jwtUtils.isExpired();
    }
    get tokenStillValid() {
        return this.jwtUtils.isStillValid();
    }
    get tokenAlmostExpired() {
        const exp = storage.getItem('bullwark:jwt-exp');
        if (!exp)
            return false;
        const timeLeft = (Number(exp) * 1000) - Date.now();
        return timeLeft < (this.config.autoRefreshBuffer ?? (2 * 60 * 1000));
    }
    userCan(uuid) {
        return this.permissionChecker.userCan(uuid);
    }
    userCanKey(key) {
        return this.permissionChecker.userCanKey(key);
    }
    userHasRole(uuid) {
        return this.permissionChecker.userHasRole(uuid);
    }
    userHasRoleKey(key) {
        return this.permissionChecker.userHasRoleKey(key);
    }
    on(event, callback) {
        this.events.on(event, callback);
    }
    off(event, callback) {
        this.events.off(event, callback);
    }
    async startRefreshInterval() {
        if (!this.config.autoRefresh || this.refreshInterval)
            return;
        this.refreshInterval = setInterval(() => {
            if (this.tokenAlmostExpired && !this.tokenExpired) {
                this.refresh().catch(console.error);
            }
        }, 30000);
    }
}
//# sourceMappingURL=auth.js.map