import './styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from './components/chakra/color-mode'
import { Api } from 'src/shared'

declare global {
  interface Window {
    api: Api
  }
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider forcedTheme="dark">
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>
)
