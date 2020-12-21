import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Table from '../common/components/Table'
import { ReportComponentProps } from './reportUtil'
import { EmptyView } from '../common/components/Messages'
import { mapKeys, omit, toString } from 'lodash'
import { DeparturePair, SortConfig } from '../schema-types'

const PairListReportView = styled.div``

const TableEmptyView = styled(EmptyView)`
  margin: 1rem !important;
`

export type PropTypes<T> = {
  sort?: SortConfig[]
  setSort?: (arg: ((sort: SortConfig[]) => SortConfig[]) | SortConfig[]) => unknown
} & ReportComponentProps<T>

const PairListReport = observer(
  ({ items, columnLabels, sort, setSort }: PropTypes<DeparturePair>) => {
    // Prepend A and B to the column labels for the respective departures.
    let pairLabels = useMemo(
      () =>
        Object.entries(columnLabels || {}).reduce((allLabels, [prop, label]) => {
          if (!label) {
            return allLabels
          }

          allLabels[prop] = label // Keep the label without modifications for the pair object itself.

          // Some labels are separated already from the server.
          if (!label.startsWith('A ') && !label.startsWith('B ')) {
            allLabels['a_' + prop] = 'A ' + label // One version of the prop prepended with a
            allLabels['b_' + prop] = 'B ' + label // And another version of the prop prepended with b
          }

          return allLabels
        }, {}),
      [columnLabels]
    )

    let rows = useMemo(
      () =>
        items.map((pair) => {
          let departureAFields = mapKeys(
            omit(pair.departureA, [
              'dayType',
              '__typename',
              'id',
              'blockNumber',
              'registryNr',
            ]),
            (val, key) => 'a_' + key // Prepend departure A props with a
          )

          let departureBFields = mapKeys(
            omit(pair.departureB, [
              'dayType',
              '__typename',
              'id',
              'blockNumber',
              'registryNr',
            ]),
            (val, key) => 'b_' + key // Prepend departure B props with b
          )

          return {
            ...omit(pair, ['departureA', 'departureB']),
            blockNumber: pair.departureA.blockNumber,
            dayType: pair.departureA.dayType,
            registryNr: pair.departureA.registryNr,
            ...departureAFields,
            ...departureBFields,
          }
        }),
      [items]
    )

    const renderCellValue = useCallback((key, val) => {
      if (typeof val === 'boolean' || typeof val === 'undefined' || val === null) {
        return (
          <span style={{ fontSize: '1.2rem', marginTop: '-3px', display: 'block' }}>
            {val ? '✓' : '⨯'}
          </span>
        )
      }

      return toString(val)
    }, [])

    return (
      <PairListReportView>
        <Table<any>
          virtualized={true}
          maxHeight={window.innerHeight * 0.75}
          items={rows}
          hideKeys={!columnLabels ? ['id'] : undefined}
          renderValue={renderCellValue}
          sort={sort}
          setSort={setSort}
          columnLabels={pairLabels}>
          <TableEmptyView>Taulukko on tyhjä.</TableEmptyView>
        </Table>
      </PairListReportView>
    )
  }
)

export default PairListReport
