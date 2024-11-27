import { Image, Box } from "@chakra-ui/react"
import SaveSelection from "@components/save-selection"
import SaveEditing from "@components/save-editing"
import fomLogo from "@assets/fom-logo.webp"
import background from "@assets/fom-bg1.png"
import { useStore } from "./store"

function Layout({ children }) {
  return (
    <Box>
      <Box
        minH="100vh"
        display="flex"
        flexDir="column"
        gap="30px"
        alignItems="center"
        pos="relative"
      >
        <Image src={fomLogo} zIndex={1} draggable={false} />
        {children}
        <Image
          src={background}
          objectFit="cover"
          h="100vh"
          w="100vw"
          alt="background"
          userSelect="none"
          draggable={false}
          pos="fixed"
          zIndex={-1}
          filter="contrast(1.2) brightness(0.08) blur(2px) saturate(1.5)"
          backgroundColor="rgba(0, 0, 139, 0.7)"
        />
      </Box>
    </Box>
  )
}

export function App() {
  const { editingSaveId } = useStore()

  return <Layout>{editingSaveId ? <SaveEditing /> : <SaveSelection />}</Layout>
}
