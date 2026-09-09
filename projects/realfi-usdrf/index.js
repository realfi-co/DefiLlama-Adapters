const { sumTokens2 } = require('../helper/chain/cardano')
const { getTokensMinted, getAccountAddresses } = require('../helper/chain/cardano/blockfrost')

// USDrf and sUSDrf are minted under the same policy, the mint proxy script hash.
const POLICY = '7d9e4a0ee1a3f5d5ff8159ea91a83310cf2795ee7a87170c7aea05ae'
const USDRF = POLICY + '55534472'

// USDCx, the Circle-backed reserve asset. USDrf has no price feed of its own, so the
// dollar supply is denominated in USDCx, which is priced and also has 6 decimals.
const USDCX = '1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e345553444378'

// USDrf locked here is reported by the RealFi Staking adapter instead.
const STAKING_VAULT = 'addr1wyh04daelcpkgahkuz2ld885w2y3wa27r7w82gzdeagsazgtwduhf'

// RealFi treasury and pre-mint wallets. USDrf held here has been minted but not issued,
// so it is not circulating supply. Excluded by stake account rather than by payment
// address, so that a further address under the same wallet is netted out automatically.
const TREASURY_ACCOUNTS = [
  'stake1uyrd4akc36tgl84djxaahka5aq9uz43kswhmw9wq4ngwtdsah34fn', // pre-mint
  'stake1u86sehlnu8tjnughwwttfprynvtp4khaeepeq20gtkpseec2cmvgy', // operational treasury
]

// The protocol's unstaked yield pot. It receives staking fees, yield forfeited on unstake,
// and the unstaked share of positive yield, and is protocol-owned until governance sweeps it,
// so it is not circulating supply. Excluded by payment address because this is an enterprise
// address with no stake key, unlike the treasury wallets above.
const YIELD_POT = 'addr1v9xdjv4h22pv2tq7vugvmyuw0uruue6hmwa86wy624ygs7gq22hrg'

async function tvl(api) {
  const minted = await getTokensMinted(USDRF)
  const treasury = await Promise.all(TREASURY_ACCOUNTS.map(getAccountAddresses))
  const owners = [STAKING_VAULT, YIELD_POT, ...treasury.flat().map((i) => i.address)]
  const balances = await sumTokens2({ owners, tokens: [USDRF] })
  api.add(USDCX, minted - (balances[`cardano:${USDRF}`] ?? 0))
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2026-06-17',
  methodology: 'TVL corresponds to the total supply of USDrf minted on Cardano, less USDrf held in the RealFi staking vault, less USDrf held in RealFi treasury and pre-mint wallets, and less USDrf held in the unstaked yield pot, which accrues staking fees, yield forfeited on unstake, and the unstaked share of yield, and is protocol-owned until swept. Staked USDrf is reported separately under RealFi Staking. USDrf is backed by a portfolio of real-world assets including money market funds, collateralized loan obligation funds, corporate bonds, and private credit. Those underlying assets are held off-chain and are not included in this figure.',
  cardano: {
    tvl,
  },
}
