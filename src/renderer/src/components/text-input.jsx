import { Field } from "@components/ui/field"
import { InputGroup } from "@components/ui/input-group"
import { Input } from "@chakra-ui/react"

export default function TextInput({ currentValue, textLabel, onChange, icon }) {
  return (
    <Field label={textLabel}>
      <InputGroup w="full" startElement={icon || null}>
        <Input value={currentValue} onChange={(e) => onChange(e.target.value)} />
      </InputGroup>
    </Field>
  )
}
