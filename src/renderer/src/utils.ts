import { HiOutlineSparkles } from 'react-icons/hi2'
import type { Weather } from 'src/shared/jsons'

interface NestedDictionary {
  [season: number]: {
    [weather: string]: string;
  };
}

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
  const clock_time = translateClockTime(time)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${clock_time[0]}:${pad(clock_time[1])} ${clock_time[2]}`
}

export function translateCalendarTime(time: number) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 2419200 seconds = 1 day because 28 days per month
  const month = Math.floor(time / 2419200) // convert seconds to months
  const day = Math.trunc((time % 2419200) / 86400)
  return [month, day]
}

export function displayCalendarTime(time: number) {
  const calendar_time = translateCalendarTime(time)
  calendar_time[1] += 1 // days start at 0
  const seasons = {
    0: 'Spring',
    1: 'Summer',
    2: 'Fall',
    3: 'Winter'
  }
  return `${seasons[calendar_time[0]]} ${calendar_time[1]}`
}

export function getWeather(time: number, forecast: Array<Weather>) {
  // Weather is stored in forecast array for the entire month
  const calendar_time = translateCalendarTime(time)
  const weather_icons: NestedDictionary = {
    0 : {
      'calm': "../assets/sprites/weather_icons/spr_ui_hud_info_backplate_weather_icon_sunny.png",
      'inclement': "inclement",
      'heavy_inclement': "heavy_inclement",
      'special': "special"
    },
    1 : {
      'calm': "../assets/sprites/weather_icons/spr_ui_hud_info_backplate_weather_icon_sunny.png",
      'inclement': "inclement",
      'heavy_inclement': "heavy_inclement",
      'special': "special"
    }
}
if (calendar_time[0] in Object.keys(weather_icons)) {
  console.log(weather_icons[calendar_time[0]['calm']]);
}
return forecast[calendar_time[1]]
}

export function displayWeather(time: number, forecast: Array<Weather>) {
  const weather = getWeather(time, forecast)
  return `${weather.replaceAll('_', ' ')}`
}