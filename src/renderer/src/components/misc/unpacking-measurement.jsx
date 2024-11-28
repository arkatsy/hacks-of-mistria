import { useState, useEffect } from "react"
import { Stack, Text, HStack, Box } from "@chakra-ui/react"
import { InputNumber } from "src/components/custom/number-input"
import { Button } from "src/components/primitives/button"

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
    <Stack pos="relative" pb="8">
      <Text textAlign="left" textStyle="xl">
        Measure Unpacking Time
      </Text>
      <HStack>
        <Box maxW="300px">
          <InputNumber
            value={unpackingAmount}
            onValueChange={setUnpackingAmount}
            step={1}
            disabled={isLoading}
          />
        </Box>
        <Button variant="surface" onClick={handleClick} loading={isLoading}>
          Test!
        </Button>
      </HStack>
      {report && (
        <Text pos="absolute" bottom="0">
          {report}
        </Text>
      )}
    </Stack>
  )
}
