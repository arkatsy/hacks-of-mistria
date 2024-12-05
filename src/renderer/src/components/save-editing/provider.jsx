import { useRef } from "react"
import { createEditorStore, EditorContext } from "src/components/save-editing/store"

export function EditorProvider({ children, ...props }) {
  const storeRef = useRef()
  if (!storeRef.current) {
    storeRef.current = createEditorStore(props)
  }

  return <EditorContext.Provider value={storeRef.current}>{children}</EditorContext.Provider>
}
