import "./styles/globals.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import { Provider } from "./components/chakra/provider"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider forcedTheme="dark">
      <App />
    </Provider>
  </StrictMode>
)
