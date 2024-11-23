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
    <SelectRoot collection={collection} size="md" onValueChange={(e) => onValueChange(e.value[0])}>
      <SelectLabel>{textLabel}</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={currentValue} />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
