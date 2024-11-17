import "./styles/globals.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import { Provider } from "./components/ui/provider"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider forcedTheme="dark">
      <App />
    </Provider>
  </StrictMode>
)
