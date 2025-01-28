import { CacheProviderFactory } from '../../cache/cache.provider.factory';
import { AuthCredentials } from './auth.interfaces';
import { BthContext } from '../gateway.interfaces';
import { AuthImplRequestException, AuthImplException } from './auth.errors';
import { AuthProvider } from './auth.provider';
import { CacheProvider } from '../../cache/cache.provider';
import assert from 'assert';

/**
 * A classe AuthImpl fornece métodos para interagir com um serviço de autenticação.
 * Ela recupera credenciais de autenticação com base no contexto fornecido.
 */
class AuthImpl implements AuthProvider {
    private authUri: string;
    private cacheProvider: CacheProvider;

    /**
     * Construtor da classe AuthImpl.
     */
    constructor() {
        const authUri = process.env.AUTH_URI;
        assert(authUri, 'A variável de ambiente AUTH_URI não está definida');
        this.authUri = authUri;
        this.cacheProvider = CacheProviderFactory.createCacheProvider();
    }

    /**
     * Recupera as credenciais de autenticação com base no contexto fornecido.
     *
     * @param contexto - O contexto contendo as informações necessárias para obter as credenciais.
     * @returns Uma promessa que resolve as credenciais de autenticação.
     * @throws AuthImplException - Se ocorrer um erro inesperado durante a operação de busca.
     * @throws AuthImplRequestException - Se a resposta do serviço de autenticação não for bem-sucedida.
     */
    public async auth(contexto: BthContext): Promise<AuthCredentials> {
        const cacheKey = this.generateCacheKey(contexto);

        const cachedValue = await this.cacheProvider.get(cacheKey);
        if (cachedValue) {
            console.log('Cache hit');
            return JSON.parse(cachedValue);
        }
        console.log('Cache miss');

        const credentials = await this.requestCredentials(contexto);
        await this.cacheProvider.set(cacheKey, JSON.stringify(credentials));

        return credentials;
    }

    private async requestCredentials(contexto: BthContext): Promise<AuthCredentials> {
        const urlComParametros = this.buildUrlWithParams(contexto);
        let resposta: Response;
        try {
            resposta = await fetch(urlComParametros, this.getRequestOptions());
        } catch (error) {
            throw new AuthImplException('Ocorreu um erro inesperado', error);
        }

        assert(resposta.ok, new AuthImplRequestException(resposta.statusText));

        return await this.parseResponseToCredentials(resposta);
    }

    /**
     * Analisa a resposta fornecida para extrair as credenciais de autenticação.
     *
     * @param resposta - O objeto de resposta a ser analisado.
     * @returns Uma promessa que resolve para um objeto AuthCredentials.
     * @throws AuthImplException se campos obrigatórios estiverem ausentes na resposta.
     */
    private async parseResponseToCredentials(resposta: Response): Promise<AuthCredentials> {
        const credenciais: AuthCredentials = await resposta.json();
        assert(
            credenciais.uriRedirect,
            new AuthImplException('Campo obrigatório ausente: uriRedirect')
        );
        assert(credenciais.method, new AuthImplException('Campo obrigatório ausente: method'));

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

    /**
     * Gera uma chave de cache única com base no contexto fornecido.
     *
     * @param contexto - O contexto para gerar a chave do cache.
     * @returns Uma string única representando a chave do cache.
     */
    private generateCacheKey(contexto: BthContext): string {
        return `${contexto.database}:${contexto.entity}:${contexto.system}`;
    }
}

export { AuthImpl };
