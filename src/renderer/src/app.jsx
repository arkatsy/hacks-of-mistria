import { Image, Box } from "@chakra-ui/react"
import SaveSelection from "@components/save-selection"
import SaveEditing from "@components/save-editing"
import fomLogo from "@assets/fom-logo.webp"
import fomClouds from "@assets/fom-clouds.png"
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
        <Image
          src={fomClouds}
          objectFit="cover"
          h="250px"
          w="100vw"
          alt="background"
          userSelect="none"
          draggable={false}
          borderBottomRadius="5px"
          pos="absolute"
        />
        <Image src={fomLogo} zIndex={1} draggable={false} />
        {children}
      </Box>
    </Box>
  )
}

export function App() {
  const { editingSaveId } = useStore()

  return <Layout>{editingSaveId ? <SaveEditing /> : <SaveSelection />}</Layout>
}
