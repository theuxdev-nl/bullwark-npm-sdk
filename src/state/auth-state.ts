import {AuthConfig, AuthResponse, JwtPayload, User} from "../types/types";
import * as storageModule from "local-storage-fallback";
const storage = storageModule.default || storageModule;
import {APIClient} from "../api/client";
import {UserMissing} from "../errors/errors";
import {JWTVerifier} from "../jwt/verifier";

export class AuthState {

    public initialized: boolean = false;
    public user: User|undefined = undefined;
    public isAuthenticated: boolean = false;
    public storedJwtToken: string | null | undefined = undefined;
    public storedRefreshToken: string|undefined = undefined;
    public jwtTokenExpiresAt: number|undefined = undefined;
    public detailsHash: string | null | undefined = undefined;
    public apiClient: APIClient;
    public config: AuthConfig;
    public jwtVerifier: JWTVerifier;

    constructor(config: AuthConfig) {
        this.config = config;
        this.jwtVerifier = new JWTVerifier(this.config);
        const existingJwt = storage.getItem('bullwark:jwt');
        const existingExp = storage.getItem('bullwark:jwt-exp');
        const existingRefresh = config.useCookie ? undefined : storage.getItem('bullwark:refresh');
        this.apiClient = new APIClient(this.config, this);

        if(existingJwt){
            this.storedJwtToken = existingJwt;
        }

        if(existingExp){
            this.jwtTokenExpiresAt = Number(existingExp);
        }

        if(existingRefresh){
            this.storedRefreshToken = existingRefresh;
        }
    }

    finishInitialing() {
        this.initialized = true;
    }

    invalidate() {
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
        this.isAuthenticated = false;
        storage.removeItem('bullwark:jwt');
        storage.removeItem('bullwark:jwt-exp');
    }
}