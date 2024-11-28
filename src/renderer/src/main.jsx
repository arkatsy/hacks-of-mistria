import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "src/app.jsx"
import { Provider as CustomChakraProvider } from "src/components/primitives/provider.jsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { systemValue } from "src/theme.js"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomChakraProvider systemValue={systemValue} forcedTheme="dark" colorPalette="gray">
        <App />
      </CustomChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
