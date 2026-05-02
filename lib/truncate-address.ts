import { getAddress } from "viem" // wagmi uses viem internally

/**
 * Truncates an Ethereum address with checksum formatting.
 *
 * @param address - The Ethereum address to truncate.
 * @param startLength - Number of characters to show at the start. Default is 6.
 * @param endLength - Number of characters to show at the end. Default is 4.
 * @returns The checksummed and truncated address.
 */
export function truncateAddress(
  address?: `0x${string}`,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return ""
  const checksummed = getAddress(address)
  if (checksummed.length <= startLength + endLength) return checksummed
  return `${checksummed.slice(0, startLength)}...${checksummed.slice(-endLength)}`
}
