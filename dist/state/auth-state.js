import storage from 'local-storage-fallback';
export class AuthState {
    constructor(config) {
        this.initialized = false;
        this.authenticated = false;
        this.jwt = undefined;
        this.jwtExp = undefined;
        this.refreshToken = undefined;
        this.detailsHash = undefined;
        this.previousDetailsHash = undefined;
        this.user = undefined;
        this.userCachedAt = undefined;
        this.config = config;
        const existingJwt = storage.getItem('bullwark:jwt') || undefined;
        const existingExp = storage.getItem('bullwark:jwt-exp') ? Number(storage.getItem('bullwark:jwt-exp')) : undefined;
        const existingRefresh = !this.config.useCookie
            ? storage.getItem('bullwark:refresh-token')
            : undefined;
        if (existingJwt) {
            this.jwt = existingJwt;
        }
        if (existingExp) {
            this.jwtExp = Number(existingExp);
        }
        if (existingRefresh) {
            this.refreshToken = existingRefresh;
        }
    }
    // Getters ========================================================
    /**
     * Check if the service is done loading.
     * @returns boolean - False while the app is still starting (checking JWT / refresh token)
     */
    getIsInitialized() {
        return this.initialized;
    }
    /**
     * Get user's details stored from memory.
     * @returns ?User
     */
    getUser() {
        return this.user;
    }
    /**
     * Check if the user is successfully logged in.
     * @returns boolean
     */
    getAuthenticated() {
        return this.authenticated;
    }
    /**
     * Get the current jwt.
     * @returns ?string
     */
    getJwt() {
        return this.jwt;
    }
    /**
     * Get the exp (timestamp) when the stored JWT is going to expire.
     * @returns ?number
     */
    getJwtExp() {
        return this.jwtExp;
    }
    /**
     * Returns the refreshToken from memory.
     * (Not recommended for client-side apps, use HTTP-only cookies instead. Default if 'useCookie' is set to true).
     * @returns ?string
     */
    getRefreshToken() {
        return this.refreshToken;
    }
    /**
     * Returns a timestamp of when the user was last stored.
     * If the detailsHash hasn't changed in a while during one session, this can become an old timestamp.
     * This is by design.
     */
    getUserCachedAt() {
        return this.userCachedAt;
    }
    /**
     * Check if the detailsHash has been updated.
     * This hash is composed of the user's ability and role Uuids, and the updatedAt value.
     * In order to prevent unneeded API calls, only fetch on hash change.
     * @returns boolean
     */
    getDetailsHashChanged() {
        if (!this.detailsHash)
            return false;
        return this.previousDetailsHash !== this.detailsHash;
    }
    // Setters ========================================================
    /**
     * Store the retrieved User from the '/me' endpoint.
     * Save a timestamp of when the user was cached.
     * @param user
     */
    setUser(user) {
        this.user = user;
        this.userCachedAt = Date.now();
        return this;
    }
    /**
     * Set the authenticated field
     * @param authenticated
     */
    setAuthenticated(authenticated) {
        this.authenticated = authenticated;
        return this;
    }
    /**
     * Store the JWT in state, AFTER verification.
     * @param rawJwt - Raw JWT string
     * @param header - Decoded JWT header
     * @param payload - Decoded JWT payload
     * @param persist - Whether to persist the tokens to localStorage (or any storage fallback). Default: true
     *
     */
    setJwt(rawJwt, header, payload, persist = true) {
        this.jwt = rawJwt;
        this.jwtExp = payload.exp;
        this.previousDetailsHash = this.detailsHash;
        this.detailsHash = payload['detailsHash'];
        if (persist) {
            storage.setItem('bullwark:jwt', this.jwt);
            storage.setItem('bullwark:jwt-exp', this.jwtExp.toString());
        }
        return this;
    }
    /**
     * Store a refreshToken in memory
     * Not recommended on client-side apps: set 'useCookie' config to true and use HTTP-only cookies.
     * @throws Error - If function is called when 'useCookie' is set to true (for safety)
     * @param refreshToken
     */
    setRefreshToken(refreshToken) {
        if (this.config.useCookie) {
            throw new Error('Cannot store refreshToken in store when useCookie is enabled.');
        }
        this.refreshToken = refreshToken;
        storage.setItem('bullwark:refresh-token', this.refreshToken);
        return this;
    }
    /**
     * Set the authState to 'initialized'.
     */
    finishInitialing() {
        this.initialized = true;
        return this;
    }
    /**
     * Perform a 'logout' option on the local state, to remove all stored values
     */
    invalidateSession() {
        storage.removeItem('bullwark:jwt');
        storage.removeItem('bullwark:jwt-exp');
        this.user = undefined;
        this.authenticated = false;
        this.jwt = undefined;
        this.refreshToken = undefined;
        this.jwtExp = undefined;
        this.detailsHash = undefined;
        return this;
    }
}
//# sourceMappingURL=auth-state.js.map