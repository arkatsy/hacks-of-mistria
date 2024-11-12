import { HiOutlineSparkles } from 'react-icons/hi2'
import type { Weather } from 'src/shared/jsons'

export function translatePlaytime(time: number) {
  // 22229.607 -> 6:10:29
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  return [hours, minutes, seconds]
}

export function displayPlaytime(time: number) {
  const playtime = translatePlaytime(time)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${playtime[0]}:${pad(playtime[1])}:${pad(playtime[2])}`
}

export function translateClockTime(time: number) {
  // 22032 -> 6:00 AM
  // 59152 -> 4:20 PM
  var hours = Math.floor(time / 3600)
  const meridiem = hours >= 12 && hours < 24 ? 'PM' : 'AM'
  hours = hours > 12 ? hours % 12 : hours // change from military time
  hours = hours == 0 ? 12 : hours // hard code 24:00 to 12:00
  var minutes = Math.floor((time % 3600) / 60)
  minutes -= minutes % 10
  return [hours, minutes, meridiem]
}

export function displayClockTime(time: number) {
  const clockTime = translateClockTime(time)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${clockTime[0]}:${pad(clockTime[1])} ${clockTime[2]}`
}

export function translateCalendarTime(time: number) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 2419200 seconds = 1 day because 28 days per month
  const season = Math.floor(time / 2419200) // convert seconds to months
  const day = Math.trunc((time % 2419200) / 86400)
  return [season, day]
}

export function displayCalendarTime(time: number) {
  const calendarTime = translateCalendarTime(time)
  calendarTime[1] += 1 // days start at 0
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter']
  return `${seasons[calendarTime[0]]} ${calendarTime[1]}`
}

export function getWeather(time: number, forecast: Array<Weather>) {
  // Weather is stored in forecast array for the entire month
  const calendarTime = translateCalendarTime(time)
  return forecast[calendarTime[1]]
}

export function displayWeather(time: number, forecast: Array<Weather>) {
  const calendarTime = translateCalendarTime(time)
  const weather = getWeather(time, forecast)
  console.log([calendarTime[0], weather])
  return [calendarTime[0], weather]
}