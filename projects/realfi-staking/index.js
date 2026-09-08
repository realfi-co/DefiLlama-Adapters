const { sumTokens2 } = require('../helper/chain/cardano')

const POLICY = '7d9e4a0ee1a3f5d5ff8159ea91a83310cf2795ee7a87170c7aea05ae'
const USDRF = POLICY + '55534472'

// USDCx, the Circle-backed reserve asset. USDrf has no price feed of its own, so the
// locked balance is denominated in USDCx, which is priced and also has 6 decimals.
const USDCX = '1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e345553444378'

// Enterprise script address of the staking vault validator, hash
// 2efab7b9fe036476f6e095f69cf4728917755e1f9c75204dcf510e89.
const STAKING_VAULT = 'addr1wyh04daelcpkgahkuz2ld885w2y3wa27r7w82gzdeagsazgtwduhf'

async function tvl(api) {
  const balances = await sumTokens2({ owner: STAKING_VAULT, tokens: [USDRF] })
  api.add(USDCX, balances[`cardano:${USDRF}`] ?? 0)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2026-06-17',
  methodology: 'TVL corresponds to USDrf locked in the RealFi staking vault on Cardano, read from the vault script address. RealFi operates a two-token structure: USDrf is the stable token, pegged to one US dollar, and sUSDrf is the staked token. Holders deposit USDrf and receive sUSDrf, whose exchange rate is the vault settled USDrf backing divided by the circulating sUSDrf supply, so it rises as the backing portfolio earns and falls when it loses. Gains and losses split between staked and unstaked supply by the same formula in both directions. USDrf held outside the vault is reported separately under RealFi USDrf.',
  cardano: {
    tvl,
  },
}
