import './globals.css'
import fomBackground from './assets/fom-background.webp'
import characterSprite from './assets/spr_character_mask.png'
import droopyEyes from './assets/spr_ui_item_wearable_eyes_droopy_asset.png'
import { Image, Box, Text, Card, Button, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { translatePlaytime, translateClockTime, translateCalendarTime } from './utils'

export function App() {
  return (
    <Box minH="100svh" bg="black" color="gray.50">
      <Box display="flex" justifyContent="center">
        <Image
          src={fomBackground}
          objectFit="cover"
          alt="background"
          userSelect="none"
          draggable={false}
        />
      </Box>
      <Editor />
    </Box>
  )
}

function Editor() {
  const [step, setStep] = useState(0)
  const saves = window.api.getSaves()

  const goBack = () => setStep(0)
  const goForward = () => setStep(1)

  return (
    <Box mx={20}>
      {step === 0 ? (
        <ChooseSave saves={saves} goForward={goForward} />
      ) : (
        <SaveEditor goBack={goBack} />
      )}
    </Box>
  )
}

function SaveEditor({ goBack }: { goBack: () => void }) {
  return (
    <Box>
      <Button onClick={goBack}>Back</Button>
      <Text>Save Editor</Text>
    </Box>
  )
}

function ChooseSave({
  saves,
  goForward
}: {
  saves: ReturnType<(typeof window)['api']['getSaves']>
  goForward: () => void
}) {
  return (
    <Box textAlign="center">
      <Box as="ul" display="flex" flexDir="column" gap={24}>
        {saves.map((save, idx) => {
          const data = {
            'Clock Time': translateClockTime(save.clockTime),
            'Calendar Time': translateCalendarTime(save.calendarTime),
            Gold: Intl.NumberFormat().format(save.gold),
            Essence: Intl.NumberFormat().format(save.essence),
            Renown: Intl.NumberFormat().format(save.renown)
          }

          return (
            <Card.Root key={idx} as="li" bg="gray.900">
              <Card.Header display="flex" flexDir="row" justifyContent="space-between">
                <Text textStyle="xl" fontFamily="cursive">
                  {save.name} {idx === 0 ? '(current)' : ''}
                </Text>

                <Box display="flex" flexDir="column">
                  <Text textStyle="xl" ml={2} fontFamily="cursive">
                    {save.farmName}
                  </Text>
                  <Text textStyle="xl" fontFamily="cursive" textAlign="end" opacity={0.9}>
                    {translatePlaytime(save.playtime)}
                  </Text>
                  <Image
                    border="1px solid red"
                    rounded="md"
                    fit="contain"
                    height="80px"
                    width="80px"
                    src={characterSprite}
                  />
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
                <Button bg="red.600" color="white" mt="4" onClick={goForward}>
                  <Text fontFamily="cursive">Edit Save</Text>
                </Button>
              </Card.Body>
            </Card.Root>
          )
        })}
      </Box>
    </Box>
  )
}
