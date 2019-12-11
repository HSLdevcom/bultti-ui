import React from 'react'
import styled from 'styled-components'
import { Inspection } from '../types/inspection'
import { useQueryData } from '../utils/useQueryData'
import gql from 'graphql-tag'

const operatorQuery = gql`
  query fetchOperator($id: String) {
    operator(id: $id) {
      id
      name
    }
  }
`

const InspectionItemView = styled.div``

export type InspectionItemProps = {
  inspection: Inspection
}

const InspectionItem = ({ inspection }: InspectionItemProps) => {
  const { data } = useQueryData({
    query: operatorQuery,
    variables: { id: inspection.operatorId },
  })

  const operatorName = data?.name || inspection.operatorId

  return (
    <InspectionItemView>
      <pre>
        <code>{JSON.stringify({ operatorName, ...inspection }, null, 2)}</code>
      </pre>
    </InspectionItemView>
  )
}

export default InspectionItem