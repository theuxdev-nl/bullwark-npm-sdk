import {AuthConfig, User} from "../types/types";
import storage from 'local-storage-fallback'
import {JWTHeaderParameters, JWTPayload} from "jose";

export class AuthState {
    private initialized: boolean = false;
    private authenticated: boolean = false;
    private jwt: string | undefined = undefined;
    private jwtExp: number | undefined = undefined;
    private refreshToken: string | undefined = undefined;
    private detailsHash: string | undefined = undefined;
    private previousDetailsHash: string | undefined = undefined;
    private readonly config: AuthConfig;

    private user: User | undefined = undefined;
    private userCachedAt: number | undefined = undefined;

    constructor(config: AuthConfig) {
        this.config = config;
        const existingJwt = storage.getItem('bullwark:jwt') || undefined;
        const existingExp = storage.getItem('bullwark:jwt-exp') ? Number(storage.getItem('bullwark:jwt-exp')) : undefined
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
    public getIsInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get user's details stored from memory.
     * @returns ?User
     */
    public getUser(): User | undefined {
        return this.user;
    }

    /**
     * Check if the user is successfully logged in.
     * @returns boolean
     */
    public getAuthenticated(): boolean {
        return this.authenticated;
    }

    /**
     * Get the current jwt.
     * @returns ?string
     */
    public getJwt(): string | undefined {
        return this.jwt;
    }

    /**
     * Get the exp (timestamp) when the stored JWT is going to expire.
     * @returns ?number
     */
    public getJwtExp(): number | undefined {
        return this.jwtExp;
    }

    /**
     * Returns the refreshToken from memory.
     * (Not recommended for client-side apps, use HTTP-only cookies instead. Default if 'useCookie' is set to true).
     * @returns ?string
     */
    public getRefreshToken(): string | undefined {
        return this.refreshToken;
    }

    /**
     * Returns a timestamp of when the user was last stored.
     * If the detailsHash hasn't changed in a while during one session, this can become an old timestamp.
     * This is by design.
     */
    public getUserCachedAt(): number | undefined {
        return this.userCachedAt;
    }

    /**
     * Check if the detailsHash has been updated.
     * This hash is composed of the user's ability and role Uuids, and the updatedAt value.
     * In order to prevent unneeded API calls, only fetch on hash change.
     * @returns boolean
     */
    public getDetailsHashChanged(): boolean {
        if (!this.detailsHash) return false;
        return this.previousDetailsHash !== this.detailsHash;
    }


    // Setters ========================================================

    /**
     * Store the retrieved User from the '/me' endpoint.
     * Save a timestamp of when the user was cached.
     * @param user
     */
    public setUser(user: User) {
        this.user = user;
        this.userCachedAt = Date.now();
        return this;
    }

    /**
     * Set the authenticated field
     * @param authenticated
     */
    public setAuthenticated(authenticated: boolean) {
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
    public setJwt(rawJwt: string, header: JWTHeaderParameters, payload: JWTPayload, persist: boolean = true) {
        this.jwt = rawJwt;
        this.jwtExp = payload.exp;
        this.previousDetailsHash = this.detailsHash;
        this.detailsHash = payload['detailsHash'] as string;

        if (persist) {
            storage.setItem('bullwark:jwt', this.jwt);
            storage.setItem('bullwark:jwt-exp', this.jwtExp!.toString());
        }

        return this;
    }

    /**
     * Store a refreshToken in memory
     * Not recommended on client-side apps: set 'useCookie' config to true and use HTTP-only cookies.
     * @throws Error - If function is called when 'useCookie' is set to true (for safety)
     * @param refreshToken
     */
    public setRefreshToken(refreshToken: string) {
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
    public finishInitialing() {
        this.initialized = true;
        return this;
    }

    /**
     * Perform a 'logout' option on the local state, to remove all stored values
     */
    public invalidateSession() {
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