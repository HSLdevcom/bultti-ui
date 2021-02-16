import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useQueryData } from '../util/useQueryData'
import { Inspection, Sanction, SanctionsResponse } from '../schema-types'
import { defaultPageConfig, useTableState } from '../common/table/useTableState'
import { Button, ButtonSize, ButtonStyle } from '../common/components/Button'
import { Text } from '../util/translate'
import { FlexRow } from '../common/components/common'
import { useMutationData } from '../util/useMutationData'
import { gql } from '@apollo/client'
import { createPageState, PageState } from '../common/table/tableUtils'
import StatefulTable from '../common/table/StatefulTable'

const FunctionsRow = styled(FlexRow)`
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid var(--lighter-grey);
  margin: -0.25rem -1rem 0;
`

let sanctionColumnLabels = {
  sanctionableType: 'Sanktioitava kohde',
  entityIdentifier: 'Tunnus',
  sanctionAmount: 'Sanktiomäärä',
  appliedSanctionAmount: 'Sovellettu sanktiomäärä',
  sanctionReason: 'Sanktioperuste',
  sanctionableKilometers: 'Sanktioitavat kilometrit',
}

let sanctionsQuery = gql`
  query sanctions($inspectionId: String!) {
    inspectionSanctions(inspectionId: $inspectionId) {
      filteredCount
      pages
      totalCount
      sort {
        column
        order
      }
      filters {
        field
        filterValue
      }
      page {
        page
        pageSize
      }
      rows {
        id
        entityIdentifier
        inspectionId
        sanctionAmount
        sanctionReason
        sanctionableKilometers
        sanctionableType
        appliedSanctionAmount
      }
    }
  }
`

let setSanctionMutation = gql`
  mutation setSanction($sanctionId: String!, $sanctionValue: Float!) {
    setSanctionValue(sanctionId: $sanctionId, sanctionValue: $sanctionValue) {
      id
      appliedSanctionAmount
    }
  }
`

export type PropTypes = {
  inspection: Inspection
}

const SanctionsContainer = observer(({ inspection }: PropTypes) => {
  let tableState = useTableState()
  let { filters = [], sort = [], page = defaultPageConfig } = tableState

  let requestVars = useRef({
    inspectionId: inspection.id,
    filters,
    sort,
    page,
  })

  let { data: sanctionsData, loading, refetch } = useQueryData<SanctionsResponse>(
    sanctionsQuery,
    {
      fetchPolicy: 'network-only',
      skip: !inspection,
      variables: { ...requestVars.current },
    }
  )

  let [execSetSanctionMutation, { loading: setSanctionLoading }] = useMutationData(
    setSanctionMutation
  )

  let onSetSanction = useCallback((sanctionId: string, sanctionValue: number) => {
    execSetSanctionMutation({
      variables: {
        sanctionId,
        sanctionValue,
      },
    })
  }, [])

  let onUpdateFetchProps = useCallback(() => {
    requestVars.current.filters = filters
    refetch({ ...requestVars.current, sort, page })
  }, [refetch, requestVars.current, filters, sort, page])

  // Trigger the refetch when sort or page state changes. Does NOT react to
  // filter state, which is triggered separately with a button.
  useEffect(() => {
    console.log(page)
    onUpdateFetchProps()
  }, [sort, page])

  let sanctionDataItems = useMemo(() => sanctionsData?.rows || [], [sanctionsData])

  let sanctionPageState: PageState = useMemo(() => createPageState(sanctionsData), [
    sanctionsData,
  ])

  return (
    <>
      <FunctionsRow>
        <Button
          style={{ marginLeft: 'auto' }}
          buttonStyle={ButtonStyle.SECONDARY}
          size={ButtonSize.SMALL}
          onClick={onUpdateFetchProps}>
          <Text>update</Text>
        </Button>
      </FunctionsRow>
      <StatefulTable<Sanction>
        loading={loading}
        items={sanctionDataItems}
        pageState={sanctionPageState}
        tableState={tableState}
        onUpdate={onUpdateFetchProps}
        columnLabels={sanctionColumnLabels}
        keyFromItem={(item) => item.id}
      />
    </>
  )
})

export default SanctionsContainer