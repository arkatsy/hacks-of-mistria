import { memo, useCallback, useContext } from "react"
import { EditorContext } from "src/components/save-editing"
import {
  Box,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  CardRoot,
  CardBody,
  CardHeader
} from "@chakra-ui/react"
import { EditIcon } from "src/components/custom/icons"
import { NumberInput } from "src/components/custom/number-input"
import { Checkbox } from "src/components/primitives/checkbox"
import { TextInput } from "src/components/custom/text-input"

export default function RewardsInventoryEdits() {
  const { edits, setEdits } = useContext(EditorContext)

  const setInventoryItem = useCallback((id, item) => {
    const newEdits = { ...edits }
    newEdits.reward_inventory[id] = item
    setEdits(newEdits)
  }, [])

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Reward Inventory
        </Text>
      </HStack>
      <SimpleGrid columns={4} gap="8" w="full">
        {edits.reward_inventory.map((item, id) => (
          <Box key={id}>
            <RewardInventoryItem id={id} item={item} setItem={setInventoryItem} />
          </Box>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

const RewardInventoryItem = memo(function RewardInventoryItem({ id, item, setItem }) {
  const { members, required_tags } = item

  // members: [{item_id, infusion, auto_use, cosmetic, inner_item, gold_to_gain, animal_cosmetic}, {...}]

  let itemId = null
  let quantity = null
  let infusion = null
  let isAnimalCosmetic = null
  let isPlayerCosmetic = null
  let goldToGain = null
  let innerItem = null
  let autoUse = false

  if (members.length > 0) {
    itemId = members[0].item_id
    quantity = members.length
    infusion = members[0].infusion
    isAnimalCosmetic = members[0].animal_cosmetic
    isPlayerCosmetic = members[0].cosmetic
    goldToGain = members[0].gold_to_gain
    innerItem = members[0].inner_item
    autoUse = members[0].auto_use
  }

  const handleItemIdChange = (value) => {
    const newMembers = [{ auto_use: autoUse, cosmetic: isAnimalCosmetic, 
      animal_cosmetic: isAnimalCosmetic, gold_to_gain: goldToGain, 
      item_id: value, inner_item: innerItem, infusion: infusion}]
    setItem(id, { ...item, members: newMembers })
  }

  const handleQuantityChange = (value) => {
    const newMembers = [...members]
    if (value > members.length) {
      for (let i = members.length; i < value; i++) {
        newMembers.push({ ...members[0] })
      }
    } else {
      newMembers.splice(value)
    }
    setItem(id, { ...item, members: newMembers })
  }

  const handleInfusionChange = (value) => {
    const newMembers = [{ ...members[0], infusion: value }]
    setItem(id, { ...item, members: newMembers })
  }

  const handleAnimalCosmeticChange = (e) => {
    const newMembers = [{ ...members[0], animal_cosmetic: e.target.checked }]
    setItem(id, { ...item, members: newMembers })
  }

  const handlePlayerCosmeticChange = (e) => {
    const newMembers = [{ ...members[0], cosmetic: e.target.checked }]
    setItem(id, { ...item, members: newMembers })
  }

  const handleGoldToGainChange = (value) => {
    const newMembers = [{ ...members[0], gold_to_gain: value }]
    setItem(id, { ...item, members: newMembers })
  }

  return (
    <CardRoot bg="gray.950" size="sm">
      <CardHeader>
        <Text w="full">Slot {id + 1}</Text>
      </CardHeader>
      <CardBody>
        <Stack gap="4">
          <TextInput
            textLabel="Item ID"
            autoCorrect="off"
            placeholder="item_id"
            value={itemId || ""}
            onChange={handleItemIdChange}
          />
          <TextInput
            textLabel="Infusion"
            autoCorrect="off"
            placeholder="infusion"
            value={infusion || ""}
            onChange={handleInfusionChange}
          />
          <NumberInput
            label="Quantity"
            placeholder="quantity"
            value={quantity || 0}
            onValueChange={handleQuantityChange}
          />
          <NumberInput
            label="Gold To Gain"
            placeholder="Gold To Gain"
            value={goldToGain || 0}
            onValueChange={handleGoldToGainChange}
          />
          <Checkbox checked={isAnimalCosmetic} onCheckedChange={handleAnimalCosmeticChange}>
            Animal Cosmetic
          </Checkbox>
          <Checkbox checked={isPlayerCosmetic} onCheckedChange={handlePlayerCosmeticChange}>
            Player Cosmetic
          </Checkbox>
        </Stack>
      </CardBody>
    </CardRoot>
  )
})
