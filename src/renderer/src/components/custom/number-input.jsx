import { NumberInputRoot, NumberInputField } from "src/components/primitives/number-input"
import { InputGroup } from "src/components/primitives/input-group"
import { Field } from "src/components/primitives/field"
import { memo } from "react"

export const NumberInput = memo(function NumberInput({
  value,
  onValueChange,
  step,
  min,
  label,
  helper,
  icon
}) {
  return (
    <Field label={label} helperText={helper || ""}>
      <NumberInputRoot
        min={min || 0}
        step={step || 1}
        value={+value || 0}
        onValueChange={(e) => onValueChange(+e.value)}
        w="full"
      >
        <InputGroup flex="1" w="full" startElement={icon || null}>
          <NumberInputField />
        </InputGroup>
      </NumberInputRoot>
    </Field>
  )
})
