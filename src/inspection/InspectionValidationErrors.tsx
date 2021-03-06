import React from 'react'
import { observer } from 'mobx-react-lite'
import { ErrorView, MessageContainer } from '../common/components/Messages'
import { text } from '../util/translate'
import { groupBy } from 'lodash'
import { Inspection } from '../schema-types'

export type PropTypes = {
  inspection: Inspection
}

const InspectionValidationErrors = observer(({ inspection }: PropTypes) => {
  let deduplicatedErrors = Object.keys(groupBy(inspection?.inspectionErrors || [], 'type'))

  return (
    <MessageContainer style={{ padding: 0 }}>
      {deduplicatedErrors.map((err) => (
        <ErrorView key={err}>{text(err)}</ErrorView>
      ))}
    </MessageContainer>
  )
})

export default InspectionValidationErrors
