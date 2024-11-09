import './globals.css'
import fomClouds from './assets/fom-clouds.png'
import fomLogo from './assets/fom-logo.webp'
import { Image, Box, Text, Card, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { translatePlaytime, translateClockTime, translateCalendarTime } from './utils'

export function App() {
  return (
    <Box minH="100svh" bg="black" color="gray.50" display="flex" flexDir="column" gap="50px">
      <Box display="flex" justifyContent="center" pos="relative">
        <Image
          src={fomClouds}
          objectFit="cover"
          h="250px"
          w="100vw"
          alt="background"
          userSelect="none"
          draggable={false}
          pos="absolute"
        />
        <Image src={fomLogo} zIndex={1} />
      </Box>
      <Main />
    </Box>
  )
}

type Save = ReturnType<(typeof window)['api']['getSaves']>[0]

function Main() {
  const [step, setStep] = useState(0)
  const saves = window.api.getSaves()

  return <Box mx={20}>{step === 0 ? <SaveSelection saves={saves} /> : <SaveEditor />}</Box>
}

function SaveSelection({ saves }: { saves: Save[] }) {
  return (
    <Box textAlign="center">
      <Flex flexDir="column" gap={6}>
        {saves.map((save) => (
          <SaveCard key={save.saveId} save={save} />
        ))}
      </Flex>
    </Box>
  )
}

function SaveCard({ save }: { save: Save }) {
  const data = {
    Gold: Intl.NumberFormat().format(save.gold),
    Essence: Intl.NumberFormat().format(save.essence),
    Renown: Intl.NumberFormat().format(save.renown)
  }

  return (
    <Card.Root as="button" display="inline" bg="gray.900" w="660px" mx="auto" cursor="pointer">
      <Card.Header display="flex" flexDir="row" justifyContent="space-between">
        <Text textStyle="xl">
          {save.name} | {translateCalendarTime(save.calendarTime)} -&nbsp;
          {translateClockTime(save.clockTime)} &nbsp;
          <Box as="span">{save.isAutosave && '(autosave)'}</Box>
        </Text>

        <Box pos="relative">
          <Text textStyle="xl" ml={2}>
            {save.farmName}
          </Text>
          <Text pos="absolute" textStyle="xl" opacity={0.9} right="0">
            {translatePlaytime(save.playtime)}
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
      </Card.Body>
    </Card.Root>
  )
}

function SaveEditor() {
  return (
    <Box>
      <Text>Save Editor</Text>
    </Box>
  )
}
