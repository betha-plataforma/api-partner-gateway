import { AuthProvider } from './auth.provider';
import { AuthCredentials } from './auth.interfaces';
import { BthContext } from '../gateway.interfaces';
import { CacheProvider } from '../../cache/cache.provider';
import { CacheProviderFactory } from '../../cache/cache.provider.factory';
import { AuthImpl } from './auth.impl';

/**
 * CachingAuthProvider é uma implementação da interface AuthProvider que adiciona capacidades de cache
 * ao processo de autenticação. Ele utiliza um CacheProvider para armazenar e recuperar credenciais de autenticação,
 * reduzindo o número de chamadas para o AuthProvider subjacente.
 */
export class CachingAuthProvider extends AuthImpl implements AuthProvider {
    /**
     * O cache provider utilizado para armazenar e recuperar as credenciais de autenticação em cache.
     */
    private cacheProvider: CacheProvider;

    /**
     * Constrói uma nova instância de CachingAuthProvider.
     * @param delegate - O AuthProvider subjacente que realiza a autenticação real.
     */
    constructor(private delegate: AuthProvider) {
        super();
        this.cacheProvider = CacheProviderFactory.createCacheProvider();
    }

    /**
     * Autentica o contexto fornecido, verificando primeiro o cache para encontrar credenciais existentes.
     * Se não encontrar credenciais em cache, delega a autenticação para o AuthProvider subjacente
     * e armazena o resultado em cache.
     * @param contexto - O contexto para o qual se deseja autenticar.
     * @returns Uma promessa que resolve para as credenciais de autenticação.
     */
    public async auth(contexto: BthContext): Promise<AuthCredentials> {
        const cacheKey = this.generateCacheKey(contexto);

        const cachedValue = await this.cacheProvider.get(cacheKey);
        if (cachedValue) {
            return JSON.parse(cachedValue);
        }

        const credentials = await this.delegate.auth(contexto);
        await this.cacheProvider.set(cacheKey, JSON.stringify(credentials));

        return credentials;
    }

    /**
     * Gera uma chave de cache com base no contexto fornecido.
     * @param contexto - O contexto para o qual se deseja gerar a chave de cache.
     * @returns A chave de cache gerada.
     */
    private generateCacheKey(contexto: BthContext): string {
        return `${contexto.database}:${contexto.entity}:${contexto.system}`;
    }
}
