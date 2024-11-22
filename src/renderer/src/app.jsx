import { Image, Box } from "@chakra-ui/react"
import { useState } from "react"
import SaveSelection from "@components/save-selection"
import SaveEditing from "@components/save-editing"
import fomClouds from "@assets/fom-clouds.png"
import fomLogo from "@assets/fom-logo.webp"
import dozy from "@assets/dozy.webp"

function Layout({ children }) {
  return (
    <Box minH="100vh" display="flex" flexDir="column" gap="50px" alignItems="center">
      <Image
        src={fomClouds}
        objectFit="cover"
        h="250px"
        w="100vw"
        alt="background"
        userSelect="none"
        draggable={false}
        pos="absolute"
      />
      <Image src={fomLogo} zIndex={1} draggable={false} />
      {children}
    </Box>
  )
}

export function App() {
  const [editingSaveId, setEditingSaveId] = useState(null)

  const goToEditing = (saveId) => setEditingSaveId(saveId)
  const goToSelection = () => setEditingSaveId(null)

  return (
    <Layout>
      {editingSaveId ? (
        <SaveEditing saveId={editingSaveId} onBack={goToSelection} />
      ) : (
        <>
          <SaveSelection onSaveSelected={goToEditing} />
          <Image
            src={dozy}
            zIndex={2}
            draggable={false}
            pos="absolute"
            bottom="10"
            right="10"
            transform="scaleX(-1)"
          />
          <Image src={dozy} zIndex={2} draggable={false} pos="absolute" bottom="10" left="10" />
        </>
      )}
    </Layout>
  )
}
