import { useEffect, useRef } from 'react'
import { useStateValue } from '../state/useAppState'

export function useFormBlocker(shouldShowPrompt: boolean) {
  const idRef = useRef('')
  let [, setFormUnsaved] = useStateValue('unsavedFormIds')

  useEffect(() => {
    idRef.current = setFormUnsaved(idRef.current, shouldShowPrompt)
  }, [shouldShowPrompt])
}
