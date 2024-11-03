import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>
)
