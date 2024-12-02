import {
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem
} from "src/components/primitives/select"
import { memo } from "react"

export const SelectInput = memo(function SelectInput({
  collection,
  textLabel,
  value,
  onValueChange,
  placeholder,
  ...rest
}) {
  return (
    <SelectRoot
      collection={collection}
      value={[value]}
      onValueChange={(e) => onValueChange(e.value[0])}
      {...rest}
    >
      <SelectLabel w="fit">{textLabel}</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={placeholder} />
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
})
