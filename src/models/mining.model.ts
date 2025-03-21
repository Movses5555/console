import { UUID } from 'crypto';
import { DateTime } from 'luxon';

export default class Mining {
  constructor(
    public id: UUID,
    public userId: UUID,
    public boost_speed: number,
    public upgrade_speed: number,
    public last_claimed_at: DateTime,
    public created_at: DateTime,
    public updated_at: DateTime,
  ) {}
}
