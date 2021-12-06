// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Struct, u128, u32 } from '@polkadot/types';
  import type { AccountId32 } from '@polkadot/types/interfaces/runtime';

/** @name shidenRewardResults */
export interface shidenRewardResults extends Struct {
  readonly total: u128;
  readonly stakers: BTreeMap<AccountId32, u128>;
  readonly formerStakedEra: u32;
  readonly claimedRewards: u128;
}

export type PHANTOM_DAPPSSTAKING = 'dappsStaking';
