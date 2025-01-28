import { BthContext } from '../gateway.interfaces.js';
import { AuthCredentials } from './auth.interfaces.js';

/**
 * Interface representing a auth provider.
 *
 * @interface AuthProvider
 */
export interface AuthProvider {
    auth(context: BthContext): Promise<AuthCredentials>;
}
