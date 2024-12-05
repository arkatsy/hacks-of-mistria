import { Box, Center, Text, VStack } from "@chakra-ui/react"
import { Button } from "src/components/primitives/button"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"

export function Fallback({ error, resetErrorBoundary }) {
  return (
    <Box>
      <Center>
        <VStack>
          <Text>An error has occured: </Text>
          <Text color="red" fontFamily="monospace" textStyle="md">
            {error.message}
          </Text>
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </VStack>
      </Center>
    </Box>
  )
}

export default function ErrorBoundary({ children }) {
  return <ReactErrorBoundary FallbackComponent={Fallback}>{children}</ReactErrorBoundary>
}
