import { AuthProvider } from './auth.provider.js';
import { BthContext } from '../gateway.interfaces.js';
import { AuthCredentials } from './auth.interfaces.js';
import { CacheProvider } from '../../cache/cache.provider.js';
import { CacheProviderFactory } from '../../cache/cache.provider.factory.js';

/**
 * CachingAuthProvider é uma implementação da interface AuthProvider que adiciona capacidades de cache
 * ao processo de autenticação. Ele utiliza um CacheProvider para armazenar e recuperar credenciais de autenticação,
 * reduzindo o número de chamadas para o AuthProvider subjacente.
 */
export class CachingAuthProvider implements AuthProvider {
    /**
     * O cache provider utilizado para armazenar e recuperar as credenciais de autenticação em cache.
     */
    private cacheProvider: CacheProvider;

    /**
     * Constrói uma nova instância de CachingAuthProvider.
     * @param delegate - O AuthProvider subjacente que realiza a autenticação real.
     */
    constructor(private delegate: AuthProvider) {
        this.cacheProvider = CacheProviderFactory.createCacheProvider();
    }

    /**
     * Autentica o contexto fornecido, verificando primeiro o cache para encontrar credenciais existentes.
     * Se não encontrar credenciais em cache, delega a autenticação para o AuthProvider subjacente
     * e armazena o resultado em cache.
     * @param context - O contexto para o qual se deseja autenticar.
     * @returns Uma promessa que resolve para as credenciais de autenticação.
     */
    public async auth(context: BthContext): Promise<AuthCredentials> {
        const cacheKey = this.generateCacheKey(context);

        const cachedValue = await this.cacheProvider.get(cacheKey);
        if (cachedValue) {
            return JSON.parse(cachedValue);
        }

        const credentials = await this.delegate.auth(context);
        await this.cacheProvider.set(cacheKey, JSON.stringify(credentials));

        return credentials;
    }

    /**
     * Gera uma chave de cache com base no contexto fornecido.
     * @param context - O contexto para o qual se deseja gerar a chave de cache.
     * @returns A chave de cache gerada.
     */
    private generateCacheKey(context: BthContext): string {
        return `${context.database}:${context.entity}:${context.system}`;
    }
}
