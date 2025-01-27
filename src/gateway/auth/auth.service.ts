import { AuthCredentials } from './auth.interfaces';
import { BthContext } from '../gateway.interfaces';
import { AuthServiceRequestException, AuthServiceException } from './auth.errors';
import assert from 'assert';

/**
 * A classe AuthService fornece métodos para interagir com um serviço de autenticação.
 * Ela recupera credenciais de autenticação com base no contexto fornecido.
 */
class AuthService {
    private authUri: string;

    /**
     * Construtor da classe AuthService.
     */
    constructor() {
        const authUri = process.env.AUTH_URI;
        assert(authUri, 'A variável de ambiente AUTH_URI não está definida');
        this.authUri = authUri;
    }

    /**
     * Recupera credenciais de autenticação com base no contexto fornecido.
     *
     * @param contexto - O contexto contendo as informações necessárias para obter as credenciais.
     * @returns Uma promessa que resolve as credenciais de autenticação.
     * @throws AuthServiceException - Se ocorrer um erro inesperado durante a operação de busca.
     * @throws AuthServiceRequestException - Se a resposta do serviço de autenticação não for bem-sucedida.
     */
    public async getCredentials(contexto: BthContext): Promise<AuthCredentials> {
        // TODO: definir como autenticar com o serviço de autenticação
        // TODO: cachear as credenciais por contexto
        const urlComParametros = this.buildUrlWithParams(contexto);
        let resposta: Response;
        try {
            resposta = await fetch(urlComParametros, this.getRequestOptions());
        } catch (error) {
            throw new AuthServiceException('Ocorreu um erro inesperado', error);
        }

        assert(resposta.ok, new AuthServiceRequestException(resposta.statusText));

        return await this.parseResponseToCredentials(resposta);
    }

    /**
     * Analisa a resposta fornecida para extrair as credenciais de autenticação.
     *
     * @param resposta - O objeto de resposta a ser analisado.
     * @returns Uma promessa que resolve para um objeto AuthCredentials.
     * @throws AuthServiceException se campos obrigatórios estiverem ausentes na resposta.
     */
    private async parseResponseToCredentials(resposta: Response): Promise<AuthCredentials> {
        const credenciais: AuthCredentials = await resposta.json();
        assert(
            credenciais.uriRedirect,
            new AuthServiceException('Campo obrigatório ausente: uriRedirect')
        );
        assert(credenciais.method, new AuthServiceException('Campo obrigatório ausente: method'));

        return {
            uriRedirect: credenciais.uriRedirect,
            method: credenciais.method,
            headers: credenciais.headers
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
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    /**
     * Constrói uma URL com parâmetros de consulta com base no contexto fornecido.
     *
     * @param contexto - O contexto da requisição.
     * @returns A URL construída com os parâmetros de consulta anexados.
     */
    private buildUrlWithParams(contexto: BthContext): string {
        const parametrosQuery = new URLSearchParams(Object.entries(contexto)).toString();
        return `${this.authUri}?${parametrosQuery}`;
    }
}

export { AuthService };
