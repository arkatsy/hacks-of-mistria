import { Input } from "@chakra-ui/react"
import { InputGroup } from "src/components/primitives/input-group"
import { Field } from "src/components/primitives/field"
import { memo } from "react"

export const TextInput = memo(function TextInput({
  value,
  placeholder,
  textLabel,
  onChange,
  icon
}) {
  return (
    <Field label={textLabel}>
      <InputGroup w="full" startElement={icon || null}>
        <Input
          autoCorrect="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </InputGroup>
    </Field>
  )
})
