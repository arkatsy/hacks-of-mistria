export const seasonsList = ["Spring", "Summer", "Fall", "Winter"]

export const InventoryKeys = {
  Player: "inventory",
  Rewards: "rewardInventory"
}

export const PronounsList = {
  they_them: "they_them",
  she_her: "she_her",
  he_him: "he_him",
  she_they: "she_they",
  they_she: "they_she",
  he_they: "he_they",
  they_he: "they_he",
  he_she: "he_she",
  she_he: "she_he",
  it_its: "it_its",
  all: "all",
  none: "none"
}

/**
 * @desc Translates the playtime variable in header.json into a more accessible format
 * @param {number} time The playtime variable from header.json in seconds
 * @returns A tuple containing the playtime where
 * - playtime[0] = hours
 * - playtime[1] = minutes
 * - playtime[2] = seconds
 */
export function translatePlaytime(time) {
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
 * @param {number} time The playtime variable from header.json in seconds
 * @returns A string containing the playtime in hh:mm:ss format
 */
export function displayPlaytime(time) {
  const playtime = translatePlaytime(time)
  const pad = (num) => String(num).padStart(2, "0")
  return `${playtime[0]}:${pad(playtime[1])}:${pad(playtime[2])}`
}

/**
 * @desc Translates the clock_time variable in header.json into a more accessible format
 * @param {number} time The clock_time variable from header.json in seconds
 * @returns A tuple containing the clock time where
 * - clockTime[0] = hours
 * - clockTime[1] = minutes
 * - clockTime[2] = meridiem (AM/PM)
 */
export function translateClockTime(time) {
  // 22032 -> 6:00 AM
  // 59152 -> 4:20 PM
  let hours = Math.floor(time / 3600)
  const meridiem = hours >= 12 && hours < 24 ? "PM" : "AM"
  hours = hours > 12 ? hours % 12 : hours // change from military time
  hours = hours == 0 ? 12 : hours // hard code 24:00 to 12:00
  let minutes = Math.floor((time % 3600) / 60)
  minutes -= minutes % 10
  return [hours, minutes, meridiem]
}

/**
 * @desc Displays the clock time in a readable format
 * @param {number} time The clock_time variable from header.json in seconds
 * @returns A string containing the clock time in hh:mm XM format
 */
export function displayClockTime(time) {
  const clockTime = translateClockTime(time)
  const pad = (num) => String(num).padStart(2, "0")
  return `${clockTime[0]}:${pad(clockTime[1])} ${clockTime[2]}`
}

/**
 * @desc Translates the calendar_time variable in header.json into a more accessible format
 * @param {number} time The calendar_time variable from header.json in seconds
 * @returns A tuple containing the clock time where
 * - calendarTime[0] = year
 * - calendarTime[1] = season
 * - calendarTime[2] = day
 */
export function translateCalendarTime(time) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 86400 * 28 = 2419200 seconds = 1 month because 28 days per month
  // 2419200 * 4 = 9676800 seconds = 1 year
  const year = Math.floor(time / 9676800) + 1
  const season = Math.floor((time % 9676800) / 2419200) // convert seconds to months
  const day = Math.trunc((time % 2419200) / 86400) + 1 // days start at 0
  return [year, season, day]
}

/**
 * @desc Displays the calendar time in a readable format
 * @param {number} time The calendar_time variable from header.json in seconds
 * @returns A string containing the calendar time in Year # Season # Day # format
 */
export function displayCalendarTime(time) {
  const calendarTime = translateCalendarTime(time)
  return `Year ${calendarTime[0]} ${seasonsList[calendarTime[1]]} ${calendarTime[2]}`
}

/**
 * @desc Translates the year, season, and day variables back into a calendar_time variable
 * @param {integer} year The year # that we are wanting to translate
 * @param {integer} season The season # that we are wanting to translate (0-3)
 * @param {integer} day The day # that we are wanting to translate
 * @returns A calendar_time value that is the sum of all the inputs translated to seconds
 */
export function getCalendarTime(year, season, day) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 86400 * 28 = 2419200 seconds = 1 month because 28 days per month
  // 2419200 * 4 = 9676800 seconds = 1 year
  if (year > 0) {
    year = (year - 1) * 9676800
  }
  season = season * 2419200
  day = (day - 1) * 86400
  return year + season + day
}

/**
 * @desc Gets the current day's forecast using the current calendar time
 * @param {number} time The calendar_time variable from header.json in seconds
 * @param {Array<string>} forecast Array of all weathers for the entire current season by day
 * @returns The current day's forecast
 */
export function getWeather(time, forecast) {
  // Weather is stored in forecast array for the entire month
  const calendarTime = translateCalendarTime(time)
  return forecast[calendarTime[2] - 1]
}

/**
 * @desc Gets the properties set up for the app to display the current forecast's icon
 * @param {number} time The calendar_time variable from header.json in seconds
 * @param {Array<string>} forecast Array of all weathers for the entire current season by day
 * @returns A tuple containing weather information where
 * - weather[0] = the current season
 * - weather[1] = the forecast for the current day
 */
export function displayWeather(time, forecast) {
  const calendarTime = translateCalendarTime(time)
  const weather = getWeather(time, forecast)
  return [calendarTime[1], weather]
}
