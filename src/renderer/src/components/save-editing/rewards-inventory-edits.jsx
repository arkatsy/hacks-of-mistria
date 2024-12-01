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
  CardHeader,
  createListCollection
} from "@chakra-ui/react"
import { EditIcon } from "src/components/custom/icons"
import { NumberInput } from "src/components/custom/number-input"
import { TextInput } from "src/components/custom/text-input"
import { Inventory } from "src/inventory"
import { SelectInput } from "../custom/select-input"

const infusions = [
  "none",
  "fortified",
  "hasty",
  "leeching",
  "sharp",
  "lightweight",
  "tireless",
  "restorative",
  "speedy",
  "likeable",
  "loveable",
  "fairy",
  "quality"
]

const infusionsList = createListCollection({
  items: infusions.map((infusion) => ({
    label: infusion.at(0).toUpperCase() + infusion.slice(1),
    value: infusion === "none" ? "" : infusion
  }))
})

export default function RewardsInventoryEdits() {
  const { edits, setEdits } = useContext(EditorContext)
  const inventory = new Inventory(edits.reward_inventory)
  const slots = inventory.getSlots()

  const setItemId = useCallback((slotId, itemId) => {
    if (itemId === "") {
      inventory.freeSlot(slotId)
    } else {
      inventory.setSlotItem(slotId, itemId)
    }
    setEdits((prev) => ({ ...prev, reward_inventory: inventory.getInventory() }))
  })

  const setItemQuantity = useCallback((slotId, quantity) => {
    if (quantity > 999) {
      return
    }

    const slot = inventory.getSlot(slotId)
    if (slot.getItemId() === "") {
      return
    }

    inventory.updateItemQuantity(slotId, quantity)
    setEdits((prev) => ({ ...prev, reward_inventory: inventory.getInventory() }))
  })

  const setItemInfusion = useCallback((slotId, infusion) => {
    inventory.updateSlotItem(slotId, { infusion })
    setEdits((prev) => ({ ...prev, reward_inventory: inventory.getInventory() }))
  })

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Reward Inventory
        </Text>
      </HStack>
      <SimpleGrid columns={4} gap="8" w="full">
        {Object.values(slots).map((item) => (
          <RewardInventorySlot
            key={item.id}
            item={item}
            setItemId={setItemId}
            setItemQuantity={setItemQuantity}
            setItemInfusion={setItemInfusion}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}

const RewardInventorySlot = memo(function RewardInventorySlot({
  item,
  setItemId,
  setItemQuantity,
  setItemInfusion
}) {
  const handleChangeItemId = useCallback((val) => setItemId(item.id, val), [])
  const handleChangeItemQuantity = useCallback((val) => setItemQuantity(item.id, val), [])
  const handleChangeItemInfusion = useCallback((val) => setItemInfusion(item.id, val), [])

  return (
    <CardRoot bg="gray.950" size="sm">
      <CardHeader>
        <Text w="full">Slot {item.id + 1}</Text>
      </CardHeader>
      <CardBody>
        <Stack gap="4">
          <TextInput
            textLabel="Item ID"
            autoCorrect="off"
            placeholder="item_id"
            value={item.slot.getItemId()}
            onChange={handleChangeItemId}
          />
          <SelectInput
            collection={infusionsList}
            textLabel="Infusion"
            value={item.slot.getItemInfusion()}
            onValueChange={handleChangeItemInfusion}
          />
          <NumberInput
            label="Quantity"
            placeholder="quantity"
            value={item.slot.getItemQuantity()}
            min={item.slot.getItemId().length ? 1 : 0}
            max={999}
            step={1}
            onValueChange={handleChangeItemQuantity}
          />
        </Stack>
      </CardBody>
    </CardRoot>
  )
})
