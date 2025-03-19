import { UUID } from 'crypto';
import { DateTime } from 'luxon';

export default class BoostBlock {
  constructor(
    public id: UUID,
    public speed: number,
    public duration: number,
    public ton_price: number,
    public is_free: boolean,
    public created_at: DateTime,
    public updated_at: DateTime,
  ) {}
}
