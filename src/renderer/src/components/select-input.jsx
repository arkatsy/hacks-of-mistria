import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@components/ui/select"

export default function SelectInput({ collection, textLabel, currentValue, onValueChange }) {
  return (
    <SelectRoot collection={collection} onValueChange={(e) => onValueChange(e.value[0])}>
      <SelectLabel>{textLabel}</SelectLabel>
      <SelectTrigger bg="orange.950/10">
        <SelectValueText placeholder={currentValue} />
      </SelectTrigger>
      <SelectContent bg="orange.950">
        {collection.items.map((item) => (
          <SelectItem
            bg="orange.950/25"
            _hover={{ bg: "orange.500/25" }}
            item={item}
            key={item.value}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
