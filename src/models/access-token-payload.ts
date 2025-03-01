import { UUID } from 'crypto';

export default class AccessTokenPayload {
  constructor(public readonly userId: UUID) {}
}
