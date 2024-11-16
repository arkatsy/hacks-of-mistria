import type { Weather } from "src/shared/jsons"

/**
 * @desc Translates the playtime variable in header.json into a more accessible format
 * @param time The playtime variable from header.json in seconds
 * @returns A tuple containing the playtime where
 * - playtime[0] = hours
 * - playtime[1] = minutes
 * - playtime[2] = seconds
 */
export function translatePlaytime(time: number) {
  // 22229.607 -> 6:10:29
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  return [hours, minutes, seconds]
}

/**
 * @desc Displays the playtime in a readable format
 * @param time The playtime variable from header.json in seconds
 * @returns A string containing the playtime in hh:mm:ss format
 */
export function displayPlaytime(time: number) {
  const playtime = translatePlaytime(time)
  const pad = (num: number) => String(num).padStart(2, "0")
  return `${playtime[0]}:${pad(playtime[1])}:${pad(playtime[2])}`
}

/**
 * @desc Translates the clock_time variable in header.json into a more accessible format
 * @param time The clock_time variable from header.json in seconds
 * @returns A tuple containing the clock time where
 * - clockTime[0] = hours
 * - clockTime[1] = minutes
 * - clockTime[2] = meridiem (AM/PM)
 */
export function translateClockTime(time: number) {
  // 22032 -> 6:00 AM
  // 59152 -> 4:20 PM
  let hours = Math.floor(time / 3600)
  const meridiem = hours >= 12 && hours < 24 ? "PM" : "AM"
  hours = hours > 12 ? hours % 12 : hours // change from military time
  hours = hours == 0 ? 12 : hours // hard code 24:00 to 12:00
  let minutes = Math.floor((time % 3600) / 60)
  minutes -= minutes % 10
  return [hours, minutes, meridiem] as const
}

/**
 * @desc Displays the clock time in a readable format
 * @param time The clock_time variable from header.json in seconds
 * @returns A string containing the clock time in hh:mm XM format
 */
export function displayClockTime(time: number) {
  const clockTime = translateClockTime(time)
  const pad = (num: number) => String(num).padStart(2, "0")
  return `${clockTime[0]}:${pad(clockTime[1])} ${clockTime[2]}`
}

/**
 * @desc Translates the calendar_time variable in header.json into a more accessible format
 * @param time The calendar_time variable from header.json in seconds
 * @returns A tuple containing the clock time where
 * - calendarTime[0] = year
 * - calendarTime[1] = season
 * - calendarTime[2] = day
 */
export function translateCalendarTime(time: number) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 86400 * 28 = 2419200 seconds = 1 month because 28 days per month
  // 2419200 * 4 = 9676800 seconds = 1 year
  const year = Math.floor(time / 9676800) + 1
  const season = Math.floor((time % 9676800) / 2419200) // convert seconds to months
  const day = Math.trunc((time % 2419200) / 86400)
  return [year, season, day]
}

/**
 * @desc Displays the calendar time in a readable format
 * @param time The calendar_time variable from header.json in seconds
 * @returns A string containing the calendar time in Year # Season # Day # format
 */
export function displayCalendarTime(time: number) {
  const calendarTime = translateCalendarTime(time)
  calendarTime[2] += 1 // days start at 0
  const seasons = ["Spring", "Summer", "Fall", "Winter"]
  return `Year ${calendarTime[0]} ${seasons[calendarTime[1]]} ${calendarTime[2]}`
}

/**
 * @desc Gets the current day's forecast using the current calendar time
 * @param time The calendar_time variable from header.json in seconds
 * @param forecast Array of all weathers for the entire current season by day
 * @returns The current day's forecast
 */
export function getWeather(time: number, forecast: Array<Weather>) {
  // Weather is stored in forecast array for the entire month
  const calendarTime = translateCalendarTime(time)
  return forecast[calendarTime[2]]
}

/**
 * @desc Gets the properties set up for the app to display the current forecast's icon
 * @param time The calendar_time variable from header.json in seconds
 * @param forecast Array of all weathers for the entire current season by day
 * @returns A tuple containing weather information where
 * - weather[0] = the current season
 * - weather[1] = the forecast for the current day
 */
export function displayWeather(time: number, forecast: Array<Weather>) {
  const calendarTime = translateCalendarTime(time)
  const weather = getWeather(time, forecast)
  return [calendarTime[1], weather]
}
