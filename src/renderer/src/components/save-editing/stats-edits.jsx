import { useCallback, useContext, useMemo } from "react"
import { EditorContext } from "src/components/save-editing"
import { Stack, HStack, Grid, GridItem, Text } from "@chakra-ui/react"
import { NumberInput } from "src/components/custom/number-input"
import {
  TesseraeIcon,
  EssenceIcon,
  RenownIcon,
  EditIcon,
  HealthIcon,
  StaminaIcon,
  ManaIcon
} from "src/components/custom/icons"

export default function StatsEdits() {
  const { edits, setEdits } = useContext(EditorContext)

  const setGold = useCallback((newGold) => setEdits((edits) => ({ ...edits, gold: newGold })), [])
  const setEssence = useCallback(
    (newEssence) => setEdits((edits) => ({ ...edits, essence: newEssence })),
    []
  )
  const setRenown = useCallback(
    (newRenown) => setEdits((edits) => ({ ...edits, renown: newRenown })),
    []
  )
  const setHealth = useCallback(
    (newHealth) => setEdits((edits) => ({ ...edits, health: newHealth })),
    []
  )
  const setStamina = useCallback(
    (newStamina) => setEdits((edits) => ({ ...edits, stamina: newStamina })),
    []
  )
  const setMana = useCallback((newMana) => setEdits((edits) => ({ ...edits, mana: newMana })), [])

  const memoizedIcons = useMemo(
    () => ({
      tesserae: <TesseraeIcon />,
      essence: <EssenceIcon />,
      renown: <RenownIcon />,
      health: <HealthIcon />,
      stamina: <StaminaIcon />,
      mana: <ManaIcon />
    }),
    []
  )

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Stats 
        </Text>
      </HStack>
      <Grid templateColumns="repeat(3, 1fr)" gap="3">
        <GridItem>
          <NumberInput
            value={edits.gold}
            onValueChange={setGold}
            label="Gold"
            step={10}
            icon={memoizedIcons.tesserae}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={edits.essence}
            onValueChange={setEssence}
            label="Essence"
            step={10}
            icon={memoizedIcons.essence}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={edits.renown}
            onValueChange={setRenown}
            label="Renown"
            step={10}
            icon={memoizedIcons.renown}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={edits.health}
            onValueChange={setHealth}
            label="Health"
            step={10}
            icon={memoizedIcons.health}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={edits.stamina}
            onValueChange={setStamina}
            label="Stamina"
            step={10}
            icon={memoizedIcons.stamina}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={edits.mana}
            onValueChange={setMana}
            label="Mana"
            step={4}
            icon={memoizedIcons.mana}
          />
        </GridItem>
      </Grid>
    </Stack>
  )
}
