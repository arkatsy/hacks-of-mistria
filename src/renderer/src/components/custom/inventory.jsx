import { memo, useCallback, useContext, useMemo, useState, useRef } from "react"
import { EditorContext } from "src/components/save-editing"
import {
  Box,
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

const InventoryEdits = memo(function InventoryEdits({ inventoryKey }) {
  const { edits, setEdits } = useContext(EditorContext)
  const { current: inventory } = useRef(new Inventory(edits[inventoryKey]))
  const slots = inventory.getSlots()

  const setItemId = useCallback((slotId, itemId) => {
    if (itemId === "") {
      inventory.freeSlot(slotId)
    } else {
      inventory.setSlotItem(slotId, itemId)
    }
    setEdits((prev) => ({ ...prev, [inventoryKey]: inventory.getInventory() }))
  })

  const setItemQuantity = useCallback((slotId, quantity) => {
    if (quantity > 999) {
      return
    }

    const slot = inventory.getSlot(slotId)
    if (slot.getItemId() === "") {
      return
    }

    if (quantity === 0) {
      inventory.updateItemQuantity(slotId, 1)
      setEdits((prev) => ({ ...prev, [inventoryKey]: inventory.getInventory() }))
      return
    }

    inventory.updateItemQuantity(slotId, quantity)
    setEdits((prev) => ({ ...prev, [inventoryKey]: inventory.getInventory() }))
  })

  const setItemInfusion = useCallback((slotId, infusion) => {
    inventory.updateSlotItem(slotId, { infusion: infusion === "" ? null : infusion })
    setEdits((prev) => ({ ...prev, [inventoryKey]: inventory.getInventory() }))
  })

  return (
    <Stack gap="4">
      <SimpleGrid columns={4} gap="8" w="full">
        {Object.values(slots).map((slot, id) => (
          <InventorySlot
            key={slot.id}
            slot={slot}
            setItemId={setItemId}
            setItemQuantity={setItemQuantity}
            setItemInfusion={setItemInfusion}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
})

const itemIdsPageLimit = 60
const problematicIds = ["purse", "animal_cosmetic", "cosmetic"]
const itemIdsList = ids.items_sold.filter((itemId) => !problematicIds.includes(itemId))
function formatItemId(itemId, reverse = false) {
  const fromSymbol = reverse ? " " : "_"
  const toSymbol = reverse ? "_" : " "
  return itemId.replaceAll(fromSymbol, toSymbol)
}

const InventorySlot = memo(function InventorySlot({
  slot,
  setItemId,
  setItemQuantity,
  setItemInfusion
}) {
  const activeItemId = slot.slot.getItemId()
  const activeItemInfusion = slot.slot.getItemInfusion()
  const activeItemQuantity = slot.slot.getItemQuantity()

  const handleChangeItemId = useCallback((val) => setItemId(slot.id, val), [slot.id])
  const handleChangeItemQuantity = useCallback((val) => setItemQuantity(slot.id, val), [slot.id])
  const handleChangeItemInfusion = useCallback((val) => setItemInfusion(slot.id, val), [slot.id])

  const handleRemoveSlot = useCallback(() => {
    setItemId(slot.id, "")
    setItemIdSelected("")
  }, [slot.id])

  return (
    <CardRoot bg="black" size="sm">
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Text w="full" textStyle="lg">
            Slot {slot.id + 1}
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
          <ItemDialogButton activeItemId={activeItemId} onItemIdChange={handleChangeItemId} />
          <SelectInput
            collection={infusionsList}
            textLabel="Infusion"
            value={activeItemInfusion}
            onValueChange={handleChangeItemInfusion}
            disabled={!activeItemId}
          />
          <NumberInput
            selectTextOnFocus
            label="Quantity"
            placeholder="quantity"
            value={activeItemQuantity}
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

const ItemDialogButton = memo(function ItemDialogButton({ activeItemId, onItemIdChange }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [itemIdSelected, setItemIdSelected] = useState(activeItemId)
  const [query, setQuery] = useState("")

  const handleQueryChange = useCallback(
    (val) => {
      setQuery(val)
      setPage(1)
    },
    [query]
  )
  const handleSaveItemIdSelected = useCallback(() => {
    onItemIdChange(itemIdSelected)
    setDialogOpen(false)
  }, [itemIdSelected])
  const handlePageChange = useCallback((e) => setPage(e.page), [])
  const handleItemIdSelectedChange = useCallback((e) => setItemIdSelected(e.value), [])

  const filteredItemIds = useMemo(
    () =>
      itemIdsList
        .map(formatItemId)
        .filter((itemId) => itemId.includes(query))
        .map((formattedItem) => formatItemId(formattedItem, true)),
    [query]
  )
  const viewableItemIds = filteredItemIds.slice(
    (page - 1) * itemIdsPageLimit,
    page * itemIdsPageLimit
  )

  return (
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
  )
})

export default InventoryEdits
