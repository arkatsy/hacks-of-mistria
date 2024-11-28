import { createContext, useState } from "react"
import { Image, Box } from "@chakra-ui/react"
import SaveSelection from "src/components/save-selection"
import SaveEditing from "src/components/save-editing"
import fomLogo from "src/assets/fom-logo.webp"
import fomClouds from "src/assets/fom-clouds.png"

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

export const SaveIdContext = createContext(null)

export default function App() {
  const [editingSaveId, setEditingSaveId] = useState()

  const goToSelection = () => setEditingSaveId(null)

  const value = {
    editingSaveId,
    setEditingSaveId,
    goToSelection
  }

  return (
    <Layout>
      <SaveIdContext.Provider value={value}>
        {editingSaveId ? <SaveEditing /> : <SaveSelection />}
      </SaveIdContext.Provider>
    </Layout>
  )
}
