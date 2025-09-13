import { createConfig } from "@lifi/sdk"

export const lifiConfig = createConfig({
  integrator: "kellon",
  apiUrl: "https://li.quest/v1", // v3 API endpoint
  routeOptions: {
    slippage: 0.03, // 3% slippage
    allowSwitchChain: false,
    fee: 0.001, // 0.1% integrator fee
    bridges: {
      allow: ["stargate", "hop", "arbitrum"], // Allowed bridges
    },
    exchanges: {
      allow: ["uniswap", "sushiswap", "curve"], // Allowed DEXs
    },
  },

})
