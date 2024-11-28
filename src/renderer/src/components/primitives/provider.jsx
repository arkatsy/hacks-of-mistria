import { ChakraProvider, Theme } from "@chakra-ui/react"
import { ColorModeProvider } from "src/components/primitives/color-mode"

export function Provider({ systemValue, forcedTheme, colorPalette, ...props }) {
  return (
    <ChakraProvider value={systemValue}>
      <ColorModeProvider forcedTheme={forcedTheme}>
        <Theme
          colorPalette={colorPalette}
          bg={`${colorPalette}.950/20`}
          appearance={forcedTheme}
          {...props}
        />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
