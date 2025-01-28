import assert from 'assert';
import { AuthProvider } from './auth.provider.js';
import { AuthCredentials } from './auth.interfaces.js';
import { BthContext } from '../gateway.interfaces.js';
import { AuthImplException, AuthImplRequestException } from './auth.errors.js';
import config from '../../config/index.js';

/**
 * A classe AuthImpl fornece métodos para interagir com um serviço de autenticação.
 * Ela recupera credenciais de autenticação com base no contexto fornecido.
 */
class AuthImpl implements AuthProvider {
    private authUri: string;

    /**
     * Construtor da classe AuthImpl.
     */
    constructor() {
        const authUri = config.auth.uri;
        assert(authUri, 'A variável de ambiente AUTH_URI não está definida');
        this.authUri = authUri;
    }

    /**
     * Recupera as credenciais de autenticação com base no contexto fornecido.
     *
     * @param contexto - O contexto contendo as informações necessárias para obter as credenciais.
     * @returns Uma promessa que resolve as credenciais de autenticação.
     * @throws AuthImplException - Se ocorrer um erro inesperado durante a operação de busca.
     * @throws AuthImplRequestException - Se a resposta do serviço de autenticação não for bem-sucedida.
     */
    public async auth(context: BthContext): Promise<AuthCredentials> {
        const urlWithParams = this.buildUrlWithParams(context);
        let response: Response;

        try {
            response = await fetch(urlWithParams, this.getRequestOptions());
        } catch (error) {
            throw new AuthImplException('Ocorreu um erro inesperado', error);
        }

        assert(response.ok, new AuthImplRequestException(response.statusText));

        return await this.parseResponseToCredentials(response);
    }

    /**
     * Analisa a resposta fornecida para extrair as credenciais de autenticação.
     *
     * @param resposta - O objeto de resposta a ser analisado.
     * @returns Uma promessa que resolve para um objeto AuthCredentials.
     * @throws AuthImplException se campos obrigatórios estiverem ausentes na resposta.
     */
    private async parseResponseToCredentials(response: Response): Promise<AuthCredentials> {
        const credentials: AuthCredentials = await response.json();
        assert(
            credentials.uriRedirect,
            new AuthImplException('Campo obrigatório ausente: uriRedirect')
        );
        assert(credentials.method, new AuthImplException('Campo obrigatório ausente: method'));

        return {
            uriRedirect: credentials.uriRedirect,
            method: credentials.method,
            headers: credentials.headers
        };
    }

    /**
     * Gera as opções de solicitação para uma requisição HTTP GET.
     *
     * @returns {RequestInit} As opções de solicitação, incluindo método e cabeçalhos.
     */
    private getRequestOptions(): RequestInit {
        return {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
    }

    /**
     * Constrói uma URL com parâmetros de consulta com base no contexto fornecido.
     *
     * @param contexto - O contexto da requisição.
     * @returns A URL construída com os parâmetros de consulta anexados.
     */
    private buildUrlWithParams(context: BthContext): string {
        const queryParams = new URLSearchParams(Object.entries(context)).toString();
        return `${this.authUri}?${queryParams}`;
    }
}

export { AuthImpl };
