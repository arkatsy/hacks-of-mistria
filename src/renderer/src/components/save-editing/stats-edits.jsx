import { Stack, HStack, Grid, GridItem, Text } from "@chakra-ui/react"
import { NumberInput } from "src/components/custom/number-input"
import { TesseraeIcon, EssenceIcon, RenownIcon, EditIcon, HealthIcon, StaminaIcon, ManaIcon } from "src/components/custom/icons"
import { useStatsEdits } from "src/components/save-editing/store"

export default function StatsEdits() {
  const { gold, setGold, essence, setEssence, renown, setRenown, health, setHealth, stamina, setStamina, mana, setMana } =
    useStatsEdits()

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
          <NumberInput value={gold} onValueChange={setGold} label="Gold" step={10} icon={<TesseraeIcon />} />
        </GridItem>
        <GridItem>
          <NumberInput value={essence} onValueChange={setEssence} label="Essence" step={10} icon={<EssenceIcon />} />
        </GridItem>
        <GridItem>
          <NumberInput value={renown} onValueChange={setRenown} label="Renown" step={10} icon={<RenownIcon />} />
        </GridItem>
        <GridItem>
          <NumberInput value={health} onValueChange={setHealth} label="Health" step={10} icon={<HealthIcon />} />
        </GridItem>
        <GridItem>
          <NumberInput value={stamina} onValueChange={setStamina} label="Stamina" step={10} icon={<StaminaIcon />} />
        </GridItem>
        <GridItem>
          <NumberInput value={mana} onValueChange={setMana} label="Mana" step={4} icon={<ManaIcon />} />
        </GridItem>
      </Grid>
    </Stack>
  )
}
