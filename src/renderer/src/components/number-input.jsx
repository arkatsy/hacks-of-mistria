import { NumberInputRoot, NumberInputField } from "@components/ui/number-input"
import { Field } from "@components/ui/field"
import { InputGroup } from "@components/ui/input-group"

export default function NumberInput({ value, onValueChange, step, min, label, helper, icon }) {
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
}
