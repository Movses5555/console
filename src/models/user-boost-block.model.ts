import { UUID } from 'crypto';
import { DateTime } from 'luxon';

export default class UserBoostBlock {
  constructor(
    public id: UUID,
    public user_id: UUID,
    public boost_block_id: UUID,
    public speed: number,
    public duration: number,
    public ton_price: number,
    public is_free: boolean,
    public created_at: DateTime,
    public updated_at: DateTime,
  ) {}
}
