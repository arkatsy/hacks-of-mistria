import { Image, Box, Separator, Text, Stack, HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import SaveSelection from "@components/save-selection"
import SaveEditing from "@components/save-editing"
import fomClouds from "@assets/fom-clouds.png"
import fomLogo from "@assets/fom-logo.webp"
import dozy from "@assets/dozy.webp"
import InputNumber from "@components/number-input"
import { Button } from "@components/ui/button"

function Layout({ children }) {
  return (
    <Box>
      <Box
        minH="100vh"
        display="flex"
        flexDir="column"
        gap="50px"
        alignItems="center"
        pos="relative"
      >
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
        <Image src={fomLogo} zIndex={1} draggable={false} />
        {children}
      </Box>
      <Separator />
      <UnpackingMeasurement />
    </Box>
  )
}

function UnpackingMeasurement() {
  const [unpackingAmount, setUnpackingAmount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState("")

  useEffect(() => {
    setReport("")
  }, [unpackingAmount])

  const handleClick = async () => {
    setIsLoading(true)

    const res = await window.api.measureUnpacking(unpackingAmount)
    if (!res) {
      setReport("Something went wrong")
      setIsLoading(false)
      return
    }

    setReport(`It took ${res}s to unpack ${unpackingAmount} saves`)
    setIsLoading(false)
  }

  return (
    <Stack p="8" gap="4">
      <Text textStyle="xl">Unpacking Time Measurement</Text>
      <HStack>
        <Box maxW="300px">
          <InputNumber
            value={unpackingAmount}
            onValueChange={setUnpackingAmount}
            step={1}
            disabled={isLoading}
          />
        </Box>
        <Button colorPalette="orange" variant="surface" onClick={handleClick} loading={isLoading}>
          Test!
        </Button>
        {report && <Text>{report}</Text>}
      </HStack>
    </Stack>
  )
}

export function App() {
  const [editingSaveId, setEditingSaveId] = useState(null)

  const goToEditing = (saveId) => setEditingSaveId(saveId)
  const goToSelection = () => setEditingSaveId(null)

  return (
    <Layout>
      {editingSaveId ? (
        <SaveEditing saveId={editingSaveId} onBack={goToSelection} />
      ) : (
        <>
          <SaveSelection onSaveSelected={goToEditing} />
          <Image
            src={dozy}
            zIndex={2}
            draggable={false}
            pos="absolute"
            bottom="10"
            right="10"
            transform="scaleX(-1)"
          />
          <Image src={dozy} zIndex={2} draggable={false} pos="absolute" bottom="10" left="10" />
        </>
      )}
    </Layout>
  )
}
