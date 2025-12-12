# idOS Staking app

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Access to Arbitrum network (contracts are deployed on Arbitrum)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd staking-app
   ```

2. Install dependencies:
   ```bash
   # Using Bun
   bun install
   ```

3. (Optional) Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_APPKIT_PROJECT_ID=your_project_id_here
   ```
   
   If not provided, the app will use a default project ID for local development.

### Running Locally

1. Start the development server:
   ```bash   
   # Using Bun
   bun run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect your wallet:
   - Click "Connect an EVM wallet"
   - Select your preferred wallet
   - **Important**: Make sure you're connected to the **Arbitrum** network (contracts are deployed on Arbitrum, not mainnet)

### Building for Production

1. Build the app:
   ```bash
   bun run build
   ```

2. Preview the production build:
   ```bash
   bun run preview
   ```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Check for linting errors
- `bun run lint:fix` - Auto-fix linting errors

## Hardcoded Values

This section documents all hardcoded values currently used in the application. These should be moved to environment variables or configuration files for production deployments.

### Contract Addresses

**Token Contract:**
- Address: `0x4C85b9D56dC64276dADC1353ca94331097D351CA`
- Location: `src/lib/abi.ts` → `IDOS_TOKEN_ABI_ADDRESS`
- Network: Arbitrum

**Staking Contract:**
- Address: `0x09117A0dCE34cd32931745Ef2FD9c760C92aad2f`
- Location: `src/lib/abi.ts` → `IDOS_NODE_STAKING_ABI_ADDRESS`
- Network: Arbitrum

### Node Provider Addresses

All node providers are defined in `src/components/staking/node-provider-selector.tsx`:

1. **idOS Node**
   - Address: `0x4Bfcc302AA00c8f9bD04eBfBbd8C28762285292a`
   - APY: `10%` (hardcoded)
   - Expected Rewards: `"206.25 IDOS"` (hardcoded)

2. **Near Node**
   - Address: `0x1dafeB42aD85ECc7EBF80410d3a3F5ADA06d153A`
   - APY: `10%` (hardcoded)
   - Expected Rewards: `"206.25 IDOS"` (hardcoded)

3. **Ripple Node**
   - Address: `0x8Da270863C2fD726c28eCeB4C2763d0746e63920`
   - APY: `10%` (hardcoded)
   - Expected Rewards: `"206.25 IDOS"` (hardcoded)

4. **Tezos Node**
   - Address: `0x4DE22ae3e2AD8CE21d878c104C2bc9bE4f8529BB`
   - APY: `10%` (hardcoded)
   - Expected Rewards: `"206.25 IDOS"` (hardcoded)

### Token Price

- **Current Value**: `$3.06 USD` (hardcoded)
- **Location**: `src/lib/queries/use-token-price.ts`
- **Status**: CoinGecko API integration is commented out. The function currently returns a hardcoded price.
- **TODO**: Replace with actual CoinGecko API call or similar (see commented code in the file)

### Staking Parameters

**Unstake Delay:**
- Duration: `14 days` (1,209,600 seconds, matches the contract)
- Location: `src/lib/queries/use-withdrawable-unstaked.ts`
- Hardcoded constant: `UNSTAKE_DELAY_SECONDS`

**Token Decimals:**
- Value: `18` (used throughout the app for calculations, matches the contract)
- Used in: Multiple components for converting between wei and token units

### UI Display Values

**USD Value Calculations:**
- All USD values displayed throughout the app (balance, staked amount, rewards, etc.) are calculated using the hardcoded token price of `$3.06 USD`
- Location: `src/lib/queries/use-token-price.ts`
- Used in: All balance display components (`USDBalance` component in `src/components/staking/staking.tsx`)
- Note: Since the token price is hardcoded, all USD conversions will reflect this static value until the CoinGecko API or similar integration is enabled

**Expected Monthly Rewards:**
- Value: `0.00 IDOS` / `$0.00` (hardcoded, not calculated)
- Location: `src/components/staking/staking.tsx` (lines 154-162)
- Status: Currently displays static "0.00" values. Should be calculated dynamically based on:
  - User's total staked amount
  - Current epoch reward from the staking contract (`epochReward` function)
  - Epoch length from contract (`EPOCH_LENGTH` function)
  - Monthly projection formula: `(stakedAmount * epochReward / totalStaked) * (30 days / epochLength)`

**Default Placeholder Values:**
- Stake/Unstake form placeholder: `"100.00 IDOS"`
- Location: `src/components/staking/staking-form.tsx`
