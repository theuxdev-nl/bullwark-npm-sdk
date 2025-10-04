import { AuthConfig, UserData } from "../types/types";
import { JWTHeaderParameters, JWTPayload } from "jose";
export declare class AuthState {
    private readonly initPromise;
    private resolveInit;
    private authenticated;
    private jwt;
    private jwtExp;
    private refreshToken;
    private detailsHash;
    private previousDetailsHash;
    private readonly config;
    private user;
    private userCachedAt;
    constructor(config: AuthConfig);
    /**
     * Check if the service is done loading.
     * @returns boolean - False while the app is still starting (checking JWT / refresh token)
     */
    getIsInitialized(): Promise<boolean>;
    /**
     * Get user's details stored from memory.
     * @returns ?User
     */
    getUser(): UserData | undefined;
    /**
     * Check if the user is successfully logged in.
     * @returns boolean
     */
    getAuthenticated(): boolean;
    /**
     * Get the current jwt.
     * @returns ?string
     */
    getJwt(): string | undefined;
    /**
     * Get the exp (timestamp) when the stored JWT is going to expire.
     * @returns ?number
     */
    getJwtExp(): number | undefined;
    /**
     * Returns the refreshToken from memory.
     * (Not recommended for client-side apps, use HTTP-only cookies instead. Default if 'useCookie' is set to true).
     * @returns ?string
     */
    getRefreshToken(): string | undefined;
    /**
     * Returns a timestamp of when the user was last stored.
     * If the detailsHash hasn't changed in a while during one session, this can become an old timestamp.
     * This is by design.
     */
    getUserCachedAt(): number | undefined;
    /**
     * Check if the detailsHash has been updated.
     * This hash is composed of the user's ability and role Uuids, and the updatedAt value.
     * In order to prevent unneeded API calls, only fetch on hash change.
     * @returns boolean
     */
    getDetailsHashChanged(): boolean;
    /**
     * Store the retrieved User from the '/me' endpoint.
     * Save a timestamp of when the user was cached.
     * @param user
     */
    setUser(user: UserData): this;
    /**
     * Set the authenticated field
     * @param authenticated
     */
    setAuthenticated(authenticated: boolean): this;
    /**
     * Store the JWT in state, AFTER verification.
     * @param rawJwt - Raw JWT string
     * @param _header - Decoded JWT header
     * @param payload - Decoded JWT payload
     * @param persist - Whether to persist the tokens to localStorage (or any storage fallback). Default: true
     *
     */
    setJwt(rawJwt: string, _header: JWTHeaderParameters, payload: JWTPayload, persist?: boolean): this;
    /**
     * Store a refreshToken in memory
     * Not recommended on client-side apps: set 'useCookie' config to true and use HTTP-only cookies.
     * @throws Error - If function is called when 'useCookie' is set to true (for safety)
     * @param refreshToken
     */
    setRefreshToken(refreshToken: string): this;
    /**
     * Set the authState to 'initialized'.
     */
    finishInitializing(): this;
    /**
     * Perform a 'logout' option on the local state, to remove all stored values
     */
    invalidateSession(): this;
}
//# sourceMappingURL=auth-state.d.ts.map