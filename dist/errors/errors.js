export class BullwarkError extends Error {
    constructor(message) {
        super();
        this.message = 'Bullwark: ' + message;
        Object.setPrototypeOf(this, BullwarkError.prototype);
    }
}
export class CryptoError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = 'CryptoError';
        Object.setPrototypeOf(this, CryptoError.prototype);
    }
}
export class JwtMissingError extends BullwarkError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "JwtMissingError";
        Object.setPrototypeOf(this, JwtMissingError.prototype);
    }
}
export class ConnectionError extends BullwarkError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "ConnectionError";
        Object.setPrototypeOf(this, ConnectionError.prototype);
    }
}
export class InvalidInputError extends BullwarkError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "InvalidInputError";
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}
export class ConnectionIncorrectResponseError extends BullwarkError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "ConnectionIncorrectResponseError";
        Object.setPrototypeOf(this, ConnectionIncorrectResponseError.prototype);
    }
}
export class JwkMissingError extends BullwarkError {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "JwkMissingError";
        Object.setPrototypeOf(this, JwkMissingError.prototype);
    }
}
//# sourceMappingURL=errors.js.map