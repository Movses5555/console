import { UUID } from 'crypto';
import { DateTime } from 'luxon';

export default class UserUpgradeBlock {
  constructor(
    public id: UUID,
    public user_id: UUID,
    public upgrade_block_id: UUID,
    public speed: number,
    public point: number,
    public native_price: number,
    public ton_price: number,
    public level: number,
    public is_active: boolean,
    public created_at: DateTime,
    public updated_at: DateTime,
  ) {}
}
