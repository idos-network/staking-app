# idOS Staking & Vesting App

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- A Web3 wallet (MetaMask, Rabby, WalletConnect, etc.)
- Access to Arbitrum Sepolia testnet (for testing) or Arbitrum mainnet (for production)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd staking-app
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   Copy the example file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   VITE_APPKIT_PROJECT_ID=your_project_id_here
   VITE_ZERION_API_KEY=your_zerion_api_key_here
   ```

   Git ignores local `.env` files by default, but keeps `.env.example` in the repository as the template.

   `VITE_APPKIT_PROJECT_ID` — WalletConnect project ID. This is required to initialize Reown AppKit.

   `VITE_ZERION_API_KEY` — Zerion API key for real-time token price data. If not provided, the app falls back to CoinGecko. Get one at [developers.zerion.io](https://developers.zerion.io/).

### Running Locally

1. Start the development server:

   ```bash
   bun run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Accept the Terms & Conditions on the consent screen and click "Continue"

4. Connect your wallet:
   - Click "Connect an EVM wallet"
   - Select your preferred wallet
   - The app auto-switches to the correct chain on connect

### Building for Production

```bash
bun run build
bun run preview   # Preview the production build
```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Check for linting errors (oxlint)
- `bun run lint:fix` - Auto-fix linting errors (oxlint)
- `bun run fmt` - Format code (oxfmt)
- `bun run fmt:check` - Check formatting without writing (oxfmt)
- `bun run test` - Run unit tests (Vitest)

## Architecture

### Routing

The app uses [TanStack Router](https://tanstack.com/router) with file-based routing:

- `src/routes/__root.tsx` — Root layout with wallet connection gating, header, navigation, and chain auto-switch
- `src/routes/index.tsx` — Redirects to staking
- `src/routes/staking.tsx` — Staking page
- `src/routes/claiming.tsx` — Vesting/claiming page

### Chain Configuration

The entire app runs on a single chain, configured via `APP_CHAIN_ID` in `src/lib/abi.ts`. The root layout automatically switches the wallet to this chain on connect. All contract reads and writes target this chain explicitly.

### Staking System

The staking page connects to an idOS Node Staking contract. Users can:

1. **Stake** — Approve + stake IDOS tokens to a selected node provider
2. **Unstake** — Initiate unstaking (delay read dynamically from the contract's `UNSTAKE_DELAY`)
3. **Withdraw Unstake** — Withdraw after the delay period
4. **Claim Rewards** — Withdraw accumulated staking rewards

### Vesting System

The claiming page integrates with per-beneficiary VestingWallet contracts discovered via the TDE Disbursement contract:

1. **Contract Discovery** (`src/lib/vesting-allocations.ts`) — Calls `vestingContracts(beneficiary, modality)` on the TDE Disbursement contract for modalities 1–9, filtering out zero addresses to find the connected wallet's vesting contracts.
2. **Data Reads** (`src/lib/queries/use-vesting.ts`) — Multicall reads `start()`, `cliff()`, `duration()`, `released(token)`, `releasable(token)`, `vestedAmount(token, timestamp)`, and `balanceOf(vestingContract)` across all discovered contracts.
3. **Claiming** — Calls `release(token)` on the vesting contract to claim available tokens.
4. **Claim History** — Queries `ERC20Released` events across all user vesting contracts (last ~50k blocks).

## Contract Configuration

All contracts are on **Arbitrum** (mainnet).

| What             | Address                                      | Location                                           |
| ---------------- | -------------------------------------------- | -------------------------------------------------- |
| App Chain        | Arbitrum (`42161`)                           | `src/lib/abi.ts` → `APP_CHAIN_ID`                  |
| IDOS Token       | `0x68731d6F14B827bBCfFbEBb62b19Daa18de1d79c` | `src/lib/abi.ts` → `IDOS_TOKEN_ABI_ADDRESS`        |
| Staking Contract | `0x6132F2EE66deC6bdf416BDA9588D663EaCeec337` | `src/lib/abi.ts` → `IDOS_NODE_STAKING_ABI_ADDRESS` |
| Vesting Token    | `0x68731d6F14B827bBCfFbEBb62b19Daa18de1d79c` | `src/lib/abi.ts` → `VESTING_TOKEN_ADDRESS`         |
| TDE Disbursement | `0xdf24F4Ca9984807577d13f5ef24eD26e5AFc7083` | `src/lib/abi.ts` → `TDE_DISBURSEMENT_ADDRESS`      |

**Other hardcoded values:**

- **Node Providers** (`src/components/staking/node-provider-selector.tsx`): Three providers configured (idOS, Horizen Labs, Metapool). Provider addresses must be `allowNode`'d on the staking contract before they can receive stakes
- **APY**: dynamically calculated from on-chain `startTime`, `getNodeStakes()`, and the reward schedule in `src/lib/queries/use-staking-apy.ts`. Displays `———` when the staking pool is empty (no stakers yet)
- **Token Price**: fetched live from Zerion API (primary) with CoinGecko fallback in `src/lib/queries/use-token-price.ts`. Requires `VITE_ZERION_API_KEY` for Zerion
- **Block Explorer Links**: derived automatically from the chain config via `APP_BLOCK_EXPLORER_URL` in `src/lib/abi.ts` (currently Arbiscan for Arbitrum)
- **Vesting Type Label**: `"Linear (post-cliff)"`

## Configuration Notes

- Chain and contract addresses live in `src/lib/abi.ts`.
- WalletConnect / Reown setup and supported wallet networks live in `src/lib/appkit.tsx`.
- Token pricing uses Zerion when `VITE_ZERION_API_KEY` is set and falls back to CoinGecko otherwise.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
