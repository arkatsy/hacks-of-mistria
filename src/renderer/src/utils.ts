export function translatePlaytime(time: number) {
  // 22229.607 -> 6:10:29
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${hours}:${pad(minutes)}:${pad(seconds)}`
}

export function translateClockTime(time: number) {
  // 22032 -> 6:00 AM
  // 59152 -> 4:20 PM
  var hours = Math.floor(time / 3600)
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours > 12 ? hours % 12 : hours
  var minutes = Math.floor((time % 3600) / 60)
  minutes -= minutes % 10
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${hours}:${pad(minutes)} ${meridiem}`
}

export function translateCalendarTime(time: number) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 2419200 seconds = 1 day because 28 days per month
  const month = Math.floor(time / 2419200) // convert seconds to months
  const days = Math.trunc((time % 2419200) / 86400) + 1 // days start at 0
  const seasons = {
    0: 'Spring',
    1: 'Summer',
    2: 'Fall',
    3: 'Winter'
  }
  return `${seasons[month]} ${days}`
}
