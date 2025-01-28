export class AuthImplRequestException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}

export class AuthImplException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}
