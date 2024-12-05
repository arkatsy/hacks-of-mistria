import { useMemo } from "react"
import { useEditorContext } from "src/components/save-editing"
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
import { useShallow } from "zustand/react/shallow"

export default function StatsEdits() {
  const {
    gold,
    setGold,
    essence,
    setEssence,
    renown,
    setRenown,
    health,
    setHealth,
    stamina,
    setStamina,
    mana,
    setMana
  } = useEditorContext(
    useShallow((s) => ({
      gold: s.gold,
      setGold: s.setGold,
      essence: s.essence,
      setEssence: s.setEssence,
      renown: s.renown,
      setRenown: s.setRenown,
      health: s.health,
      setHealth: s.setHealth,
      stamina: s.stamina,
      setStamina: s.setStamina,
      mana: s.mana,
      setMana: s.setMana
    }))
  )

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
            value={gold}
            onValueChange={setGold}
            label="Gold"
            step={10}
            icon={memoizedIcons.tesserae}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={essence}
            onValueChange={setEssence}
            label="Essence"
            step={10}
            icon={memoizedIcons.essence}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={renown}
            onValueChange={setRenown}
            label="Renown"
            step={10}
            icon={memoizedIcons.renown}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={health}
            onValueChange={setHealth}
            label="Health"
            step={10}
            icon={memoizedIcons.health}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={stamina}
            onValueChange={setStamina}
            label="Stamina"
            step={10}
            icon={memoizedIcons.stamina}
          />
        </GridItem>
        <GridItem>
          <NumberInput
            value={mana}
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
