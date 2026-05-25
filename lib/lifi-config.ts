"use server";

import { createConfig, ChainId } from "@lifi/sdk";

function getRequiredEnv(name: string, varValue: string | undefined): string {
  if (!varValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return varValue;
}

export async function initLifiConfig() {
  // Load API / RPC keys from environment (server-only)
  const lifiKey = getRequiredEnv("LIFI_API_KEY", process.env.LIFI_API_ID);
  const ankrKey = getRequiredEnv("ANKR_RPC_KEY", process.env.ANKR_RPC_KEY);
  const alchemyKey = getRequiredEnv(
    "ALCHEMY_RPC_KEY",
    process.env.ALCHEMY_RPC_KEY,
  );
  const infuraKey = getRequiredEnv(
    "INFURA_RPC_KEY",
    process.env.INFURA_RPC_KEY,
  );
  const config = createConfig({
    integrator: "Kellon",
    apiKey: lifiKey,
    preloadChains: false,
    rpcUrls: {
      [ChainId.ARB]: [`https://rpc.ankr.com/arbitrum/${ankrKey}`],
      [ChainId.BSC]: [`https://rpc.ankr.com/bsc/${ankrKey}`],
      [ChainId.ETH]: [`https://rpc.ankr.com/eth/${ankrKey}`],
      [ChainId.AVA]: [`https://rpc.ankr.com/avalanche-c/${ankrKey}`],
      [ChainId.ABS]: [
        `https://abstract-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      ],
      [ChainId.APE]: ["https://apechain.drpc.org"],
      [ChainId.BAS]: [`https://rpc.ankr.com/base/${ankrKey}`],
      [ChainId.BLS]: [`https://rpc.ankr.com/blast/${ankrKey}`],
      [ChainId.POL]: [`https://rpc.ankr.com/polygon/${ankrKey}`],
      [ChainId.SCL]: [`https://scroll-mainnet.g.alchemy.com/v2/${alchemyKey}`],
      [ChainId.OPT]: [`https://optimism-mainnet.infura.io/v3/${infuraKey}`],
      [ChainId.LNA]: ["https://linea.drpc.org"],
      [ChainId.ERA]: [`https://rpc.ankr.com/zksync_era/${ankrKey}`],
      [ChainId.PZE]: [`https://rpc.ankr.com/polygon_zkevm/${ankrKey}`],
      [ChainId.DAI]: [`https://rpc.ankr.com/gnosis/${ankrKey}`],
      [ChainId.FTM]: ["https://1rpc.io/ftm"],
      [ChainId.MOO]: [`https://rpc.ankr.com/moonbeam/${ankrKey}`],
      [ChainId.MOR]: ["https://moonriver.drpc.org"],
      [ChainId.FUS]: ["https://fuse.drpc.org"],
      [ChainId.BOB]: ["https://boba-eth.drpc.org"],
      [ChainId.MOD]: ["https://mode.drpc.org"],
      [ChainId.MAM]: ["https://metis.drpc.org"],
      [ChainId.LSK]: ["https://lisk.drpc.org"],
      [ChainId.UNI]: [`https://unichain-mainnet.infura.io/v3/${infuraKey}`],
      [ChainId.AUR]: ["https://aurora.drpc.org"],
      [ChainId.SEI]: [`https://sei-mainnet.infura.io/v3/${infuraKey}`],
      [ChainId.HYP]: [
        `https://hyperliquid-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      ],
      [ChainId.IMX]: ["https://immutable-zkevm.drpc.org"],
      [ChainId.FLR]: [`https://rpc.ankr.com/flare/${ankrKey}`],
      [ChainId.SON]: ["https://sonic.drpc.org"],
      [ChainId.VAN]: ["https://rpc.vana.org"],
      [ChainId.GRA]: [`https://rpc.ankr.com/gravity/${ankrKey}`],
      [ChainId.TAI]: [`https://rpc.ankr.com/taiko/${ankrKey}`],
      [ChainId.SOE]: ["https://soneium.drpc.org"],
      [ChainId.SWL]: [`https://rpc.ankr.com/swell/${ankrKey}`],
      [ChainId.OPB]: [`https://opbnb-mainnet.g.alchemy.com/v2/${alchemyKey}`],
      [ChainId.CRN]: [`https://rpc.ankr.com/corn_maizenet/${ankrKey}`],
      [ChainId.LNS]: ["https://lens.drpc.org"],
      [ChainId.CRO]: ["https://cronos-evm-rpc.publicnode.com"],
      [ChainId.FRA]: ["https://fraxtal.drpc.org"],
      [ChainId.RSK]: ["https://public-node.rsk.co"],
      [ChainId.CEL]: [`https://rpc.ankr.com/celo/${ankrKey}`],
      [ChainId.ETL]: [`https://rpc.ankr.com/etherlink_mainnet/${ankrKey}`],
      [ChainId.WCC]: ["https://worldchain.drpc.org"],
      [ChainId.XDC]: [`https://rpc.ankr.com/xdc/${ankrKey}`],
      [ChainId.MNT]: [`https://rpc.ankr.com/mantle_sepolia/${ankrKey}`],
      [ChainId.SUP]: ["https://rpc.superposition.so"],
      [ChainId.INK]: ["https://ink.drpc.org"],
      [ChainId.BOC]: ["https://bob.drpc.org"],
      [ChainId.KAT]: ["https://rpc.katana.network"],
      [ChainId.BER]: ["https://rpc.berachain-apis.com"],
      [ChainId.KAI]: [`https://rpc.ankr.com/kaia/${ankrKey}`],
      [ChainId.PLU]: ["https://rpc.plume.org"],
      [ChainId.SOL]: [`https://solana-mainnet.g.alchemy.com/v2/${alchemyKey}`],
    },
    routeOptions: {
      slippage: 0.005,
      order: "CHEAPEST",
      allowSwitchChain: true,
      fee: 0.002,
      maxPriceImpact: 0.1,
    },
  });
  return config;
}
