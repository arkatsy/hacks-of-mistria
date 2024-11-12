import { Box, Card, Flex, Text } from '@chakra-ui/react'

import {
  translateCalendarTime,
  translateClockTime,
  translatePlaytime,
  getWeather
} from '@renderer/utils'
import { memo } from 'react'
import { SortedLoadingSaves } from 'src/shared'

type Save = SortedLoadingSaves[number]

function SaveCard({ save }: { save: Save }) {
  const data = {
    Gold: Intl.NumberFormat().format(save.header.stats.gold),
    Essence: Intl.NumberFormat().format(save.header.stats.essence),
    Renown: Intl.NumberFormat().format(save.header.stats.renown)
  }

  return (
    <Card.Root
      as="button"
      display="inline"
      bg="gray.900"
      w="full"
      mx="auto"
      cursor="pointer"
    >
      <Card.Header display="flex" flexDir="row" justifyContent="space-between" pos="relative">
        <Flex flexDir="column">
          <Text textStyle="xl">
            {save.header.name} | {translateCalendarTime(save.header.calendar_time)} -&nbsp;
            {translateClockTime(save.header.clock_time)} &nbsp;
            <Box as="span">{save.autosave && '(autosave)'}</Box>
          </Text>
          <Text textStyle="sm" opacity={0.8}>
            weather: {getWeather(save.header.calendar_time, save.header.weather.forecast)}
          </Text>
        </Flex>

        <Box pos="relative">
          <Text textStyle="xl" textAlign="end" ml={2}>
            {save.header.farm_name}
          </Text>
          <Text pos="absolute" textStyle="xl" opacity={0.9} right="0">
            {translatePlaytime(save.header.playtime)}
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
            {save.id}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}

export default memo(SaveCard)
