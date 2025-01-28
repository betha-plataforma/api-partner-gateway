import { BthContext } from '../gateway.interfaces';
import { AuthCredentials } from './auth.interfaces';

/**
 * Interface representing a auth provider.
 *
 * @interface AuthProvider
 */
export interface AuthProvider {
    auth(context: BthContext): Promise<AuthCredentials>;
}
