import 'source-map-support/register';

export class AuthorizationError extends Error {
    constructor(message?: string) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor)
    }

    throw(): void {
        throw new Error("Unauthorized");
    }
}

export class InternalServerError extends Error {
    constructor(message?: string) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor)
    }

    throw(): void {
        throw new Error();
    }
}

export class PathSpecNotFoundError extends Error {
    constructor(message?: string) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor)
    }

    throw(): void {
        throw new Error();
    }
}

export class GatewayValidationException extends Error {
    public statusCode: number;
    public errors: any;

    constructor(message: string, errors: any) {
        super(message);
        this.statusCode = 422;
        this.errors = errors;
    }
}