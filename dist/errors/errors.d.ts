export declare abstract class BullwarkError extends Error {
    protected constructor(message: string);
}
export declare class CryptoError extends Error {
    constructor(message: string);
}
export declare class JwtMissingError extends BullwarkError {
    constructor(message: string);
}
export declare class ConnectionError extends BullwarkError {
    constructor(message: string);
}
export declare class InvalidInputError extends BullwarkError {
    constructor(message: string);
}
export declare class ConnectionIncorrectResponseError extends BullwarkError {
    constructor(message: string);
}
export declare class JwkMissingError extends BullwarkError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map