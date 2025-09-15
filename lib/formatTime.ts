export const formatTime = (seconds: number): string => {
  if (seconds === 0) return "0s"
  if (seconds <= 60) return `${seconds}s`
  if (seconds <= 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)} hr${Math.round(seconds / 3600) !== 1 ? "s" : ""}`
}
