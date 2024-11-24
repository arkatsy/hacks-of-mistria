import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import InputNumber from "@components/number-input"
import { Button } from "@components/ui/button"

export default function UnpackingMeasurement() {
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
    <Stack pt="8" pl="8" gap="4" w="full">
      <Text textAlign="left" textStyle="xl">Measure Unpacking Time</Text>
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
