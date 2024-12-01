import { Popover as ChakraPopover, Portal } from "@chakra-ui/react"
import { CloseButton } from "src/components/primitives/close-button"
import { forwardRef } from "react"

export const PopoverContent = forwardRef(function PopoverContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraPopover.Positioner>
        <ChakraPopover.Content ref={ref} {...rest} />
      </ChakraPopover.Positioner>
    </Portal>
  )
})

export const PopoverArrow = forwardRef(function PopoverArrow(props, ref) {
  return (
    <ChakraPopover.Arrow {...props} ref={ref}>
      <ChakraPopover.ArrowTip />
    </ChakraPopover.Arrow>
  )
})

export const PopoverCloseTrigger = forwardRef(function PopoverCloseTrigger(props, ref) {
  return (
    <ChakraPopover.CloseTrigger
      position="absolute"
      top="1"
      insetEnd="1"
      {...props}
      asChild
      ref={ref}
    >
      <CloseButton size="sm" />
    </ChakraPopover.CloseTrigger>
  )
})

export const PopoverTitle = ChakraPopover.Title
export const PopoverDescription = ChakraPopover.Description
export const PopoverFooter = ChakraPopover.Footer
export const PopoverHeader = ChakraPopover.Header
export const PopoverRoot = ChakraPopover.Root
export const PopoverBody = ChakraPopover.Body
export const PopoverTrigger = ChakraPopover.Trigger