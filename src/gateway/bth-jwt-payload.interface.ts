export interface BthJwtPayload {
    scopes: string[];
    client: {
        name: string;
        attributes: {
            entidade: string;
            database: string;
            sistema: string;
            exigeOrigemGateway: string;
            readOnly: string;
        };
        client_id: string;
    };
    user: {
        id: string;
        // TODO: Add the missing properties
        accesses: Array<{
            [key: string]: any;
        }>;
    };
    expiresIn: number;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
}
