export default {
    types: {
        shidenRewardResults: {
            total: 'u128',
            stakers: 'BTreeMap<AccountId32, u128>',
            formerStakedEra: 'u32',
            claimedRewards: 'u128'
        }
    }
  }