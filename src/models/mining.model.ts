import { UUID } from 'crypto';

export interface Mining {
  id: UUID;
  userId: UUID;
  multiplier: number;
  lastClaimedAt: Date;
  createdAt: Date;
}
