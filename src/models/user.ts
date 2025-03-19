import { UUID } from 'crypto';

export default class User {
  constructor(
    public id: UUID,
    public is_used_daily_code: boolean,
    public is_used_daily_claim: boolean,
    public telegram_id: number,
    public username: string,
    public readonly photo_url?: string,
  ) {}
}
