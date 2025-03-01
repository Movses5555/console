import AccessTokenPayload from '../../models/access-token-payload';
import { GlobalRequest } from '../global.request';

export interface RequestWithAuth extends GlobalRequest {
  payload: AccessTokenPayload;
}
