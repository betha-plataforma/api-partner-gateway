export class AuthServiceRequestException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}

export class AuthServiceException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}
