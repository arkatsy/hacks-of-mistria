import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'

import {
  displayCalendarTime,
  displayClockTime,
  displayPlaytime,
  displayWeather
} from '@renderer/utils'
import { memo } from 'react'
import { SortedLoadingSaves } from 'src/shared'

import iconBlizzard from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_blizzard.png'
import iconLeaves from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_leaves.png'
import iconPetals from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_petals.png'
import iconRain from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_rain.png'
// import iconRainy from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_rainy.png'
import iconSnow from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_snow.png'
import iconStorm from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_storm.png'
import iconSunny from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_sunny.png'
// import iconThunderstorm from '@renderer/assets/sprites/weather-icons/spr_ui_hud_info_backplate_weather_icon_thunderstorm.png'

const weatherIcons = [
  {
    // 0: Spring
    calm: iconSunny,
    inclement: iconRain,
    heavy_inclement: iconStorm,
    special: iconPetals
  },
  {
    // 1: Summer
    calm: iconSunny,
    inclement: iconRain,
    heavy_inclement: iconStorm,
    special: 'summer_special'
  },
  {
    // 2: Fall
    calm: iconSunny,
    inclement: iconRain,
    heavy_inclement: iconStorm,
    special: iconLeaves
  },
  {
    // 3: Winter
    calm: iconSunny,
    inclement: iconSnow,
    heavy_inclement: iconBlizzard,
    special: 'winter_special'
  }
]

type Save = SortedLoadingSaves[number]

function SaveCard({ save, onClick }: { save: Save; onClick?: (saveId: string) => void }) {
  const { header, autosave, id } = save

  const data = {
    Gold: Intl.NumberFormat().format(header.stats.gold),
    Essence: Intl.NumberFormat().format(header.stats.essence),
    Renown: Intl.NumberFormat().format(header.stats.renown)
  }

  function handleClick() {
    onClick && onClick(id)
  }

  return (
    <Card.Root
      as="button"
      display="inline"
      bg="gray.900"
      w="full"
      mx="auto"
      cursor="pointer"
      onClick={handleClick}
    >
      <Card.Header display="flex" flexDir="row" justifyContent="space-between" pos="relative">
        <Flex flexDir="column">
          <Text textStyle="xl" display="flex" gap={2} alignItems="center">
            {header.name} | {displayCalendarTime(header.calendar_time)}
            <Image
              display="inline"
              h="25px"
              w="25px"
              src={
                weatherIcons[displayWeather(header.calendar_time, header.weather.forecast)[0]][
                  displayWeather(header.calendar_time, header.weather.forecast)[1]
                ]
              }
            />
            -&nbsp;
            {displayClockTime(header.clock_time)} &nbsp;
            <Box as="span">{autosave && '(autosave)'}</Box>
          </Text>
        </Flex>

        <Box pos="relative">
          <Text textStyle="xl" textAlign="end" ml={2}>
            {header.farm_name}
          </Text>
          <Text pos="absolute" textStyle="xl" opacity={0.9} right="0">
            {displayPlaytime(header.playtime)}
          </Text>
        </Box>
      </Card.Header>
      <Card.Body>
        <Flex flexDir="column" gap={1}>
          {Object.keys(data).map((key, idx) => (
            <Text key={idx}>
              {key}:{' '}
              <Box as="span" opacity="0.9">
                {data[key]}
              </Box>
            </Text>
          ))}
        </Flex>
        <Box pos="absolute" right={6} bottom={7}>
          <Text fontSize="sm" opacity="0.8">
            {id}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}

export default memo(SaveCard)
