// TODO: define a standard custom exception
export class PartnerAuthServiceException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}

export class PartnerServiceException extends Error {
    public errors?: any;

    constructor(message: string, errors?: any) {
        super(message);
        this.errors = errors;
    }
}