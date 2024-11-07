export function translatePlaytime(time: number) {
  // 22229.607 -> 6:10:29
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
