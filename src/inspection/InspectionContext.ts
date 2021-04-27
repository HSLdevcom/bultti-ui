import React from 'react'
import { Inspection } from '../schema-types'

export const InspectionContext = React.createContext<{
  inspection?: Inspection | null
  isDirty?: boolean
}>({ inspection: null, isDirty: false })
