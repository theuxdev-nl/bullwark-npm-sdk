import {AuthConfig, Jwkey, User, VerifiedJwt} from "../../types/types";

export class AuthState {
    constructor(private config: AuthConfig) {
    }
    public user: User|undefined = undefined;
    public isAuthenticated: boolean = false;
    public storedJwtToken: string|undefined = undefined;
    public storedRefreshToken: string|undefined = undefined;
    public jwtTokenExpiresAt: number|undefined = undefined;
    public detailsHash: string|undefined = undefined;

    setData(verifiedJwt: VerifiedJwt, refreshToken?: string) {
        this.storedJwtToken = verifiedJwt.jwtToken;
        this.jwtTokenExpiresAt = verifiedJwt.payload.exp!;
        this.detailsHash = verifiedJwt.payload.detailsHash!;
        this.storedRefreshToken = this.config.useCookie ? refreshToken : undefined;
    }

    setUser(user: User) {
        this.user = user;
        this.isAuthenticated = true;
    }

    invalidate() {
        this.user = undefined;
        this.isAuthenticated = false;
        this.storedJwtToken = undefined;
        this.storedRefreshToken = undefined;
        this.jwtTokenExpiresAt = undefined;
        this.detailsHash = undefined;
        this.isAuthenticated = false;
    }
}