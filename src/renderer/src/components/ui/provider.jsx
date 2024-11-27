import { ChakraProvider, Theme } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import { system } from "../../theme"

export function Provider(props) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider forcedTheme="dark">
        <Theme colorPalette="gray" bg="gray.950/20" appearance="dark" {...props} />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
