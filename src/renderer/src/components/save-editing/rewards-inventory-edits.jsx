import { memo, useCallback, useContext, useMemo, useState } from "react"
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
  createListCollection,
  Flex,
  IconButton,
  Show
} from "@chakra-ui/react"
import { EditIcon } from "src/components/custom/icons"
import { NumberInput } from "src/components/custom/number-input"
import { TextInput } from "src/components/custom/text-input"
import { Button } from "src/components/primitives/button"
import { Inventory } from "src/inventory"
import { SelectInput } from "src/components/custom/select-input"
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from "src/components/primitives/dialog"
import ids from "src/ids.json"
import { RadioCardItem, RadioCardRoot } from "src/components/primitives/radio-card"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot
} from "src/components/primitives/pagination"
import { LuTrash } from "react-icons/lu"

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
    if (quantity > 99) {
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
    inventory.updateSlotItem(slotId, { infusion: infusion === "" ? null : infusion })
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

const itemIdsPageLimit = 60
const problematicIds = ["purse"]
const itemIdsList = ids.items_sold.filter((itemId) => !problematicIds.includes(itemId))

// TODO: split the dialog to another component and clear the state
const RewardInventorySlot = memo(function RewardInventorySlot({
  item,
  setItemId,
  setItemQuantity,
  setItemInfusion
}) {
  const activeItemId = item.slot.getItemId()
  const activeItemInfusion = item.slot.getItemInfusion()
  const activeItemQuantity = item.slot.getItemQuantity()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [itemIdSelected, setItemIdSelected] = useState(activeItemId)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChangeItemId = useCallback((val) => setItemId(item.id, val), [item.id])
  const handleChangeItemQuantity = useCallback((val) => setItemQuantity(item.id, val), [item.id])
  const handleChangeItemInfusion = useCallback((val) => setItemInfusion(item.id, val), [item.id])
  const formatItemId = useCallback((itemId) => itemId.replaceAll("_", " "), [item.id])
  const handlePageChange = useCallback((e) => setPage(e.page), [])
  const handleItemIdSelectedChange = useCallback((e) => setItemIdSelected(e.value), [])
  const handleRemoveSlot = useCallback(() => {
    setItemId(item.id, "")
    setItemIdSelected("")
  }, [item.id])
  const handleSaveItemIdSelected = () => {
    handleChangeItemId(itemIdSelected)
    setDialogOpen(false)
  }
  const handleQueryChange = (val) => {
    setQuery(val)
    setPage(1)
  }

  const filteredItemIds = useMemo(
    () => itemIdsList.filter((itemId) => itemId.includes(query)),
    [query]
  )
  const viewableItemIds = filteredItemIds.slice(
    (page - 1) * itemIdsPageLimit,
    page * itemIdsPageLimit
  )

  return (
    <CardRoot bg="black" size="sm">
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Text w="full" textStyle="lg">
            Slot {item.id + 1}
          </Text>
          <IconButton
            size="sm"
            colorPalette="red"
            disabled={!activeItemId}
            onClick={handleRemoveSlot}
          >
            <LuTrash />
          </IconButton>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack gap="4">
          <DialogRoot
            open={dialogOpen}
            onOpenChange={(e) => setDialogOpen(e.open)}
            size="lg"
            motionPreset="slide-in-bottom"
          >
            <DialogTrigger asChild>
              <Button variant="outline">{formatItemId(activeItemId) || "Empty"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose an item id</DialogTitle>
              </DialogHeader>
              <DialogBody display="flex" flexDir="column" alignItems="center" gap={4}>
                <TextInput
                  textLabel="Search"
                  placeholder="e.g moth"
                  value={query}
                  onChange={handleQueryChange}
                />
                <RadioCardRoot value={itemIdSelected} onValueChange={handleItemIdSelectedChange}>
                  <Flex flexWrap="wrap" gap="2">
                    {viewableItemIds.map((itemId) => (
                      <RadioCardItem
                        w="fit"
                        whiteSpace="nowrap"
                        key={itemId}
                        label={formatItemId(itemId)}
                        value={itemId}
                        indicator={false}
                      />
                    ))}
                  </Flex>
                </RadioCardRoot>
                <PaginationRoot
                  variant="solid"
                  count={filteredItemIds.length}
                  pageSize={itemIdsPageLimit}
                  defaultPage={1}
                  onPageChange={handlePageChange}
                  display="flex"
                  gap={3}
                  justifyContent="center"
                >
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </PaginationRoot>
              </DialogBody>
              <DialogFooter pos="relative">
                <Box pos="absolute" left={0} ml="5">
                  <Show when={itemIdSelected}>Selected ID: "{formatItemId(itemIdSelected)}"</Show>
                </Box>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button onClick={handleSaveItemIdSelected}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>

          <SelectInput
            collection={infusionsList}
            textLabel="Infusion"
            value={activeItemInfusion}
            onValueChange={handleChangeItemInfusion}
            disabled={!activeItemId}
          />
          <NumberInput
            label="Quantity"
            placeholder="quantity"
            value={activeItemQuantity}
            // min={1}
            max={999}
            step={1}
            onValueChange={handleChangeItemQuantity}
            disabled={!activeItemId}
          />
        </Stack>
      </CardBody>
    </CardRoot>
  )
})
