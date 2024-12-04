import FireBaseAuthentication from './FireBaseAuthentication';
import { Authentication } from './AuthenticationInterface';

const authentication : Authentication = new FireBaseAuthentication();
export { authentication };
