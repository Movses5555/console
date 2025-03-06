import { UUID } from 'crypto';

export default class User {
  constructor(
    public id: UUID,
    public telegram_id?: number,
    public username?: string,
    public readonly photo_url?: string,
  ) {}
}
