import React, { useMemo } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { LoadingDisplay } from '../components/Loading'
import TableFiltersControl from './TableFiltersControl'
import { TableStateType } from './useTableState'
import {
  IFilteredSortedResponse,
  TableItemType,
  TableRowWithDataAndFunctions,
  useRenderCellValue,
} from './tableUtils'
import { groupBy, pick } from 'lodash'
import { TablePropTypes } from './Table'
import { EmptyView } from '../components/Messages'
import { Text } from '../../util/translate'
import PagedTable from './PagedTable'
import { SmallHeading, SubHeading } from '../components/Typography'

const TableViewWrapper = styled.div`
  position: relative;
`

const TableEmptyView = styled(EmptyView)`
  margin: 1rem !important;
`

export type PropTypes<ItemType extends TableItemType> = {
  tableState: TableStateType
  data?: IFilteredSortedResponse<ItemType>
  loading?: boolean
  groupBy?: (item: ItemType) => string
  transformItems?: (items: ItemType[]) => ItemType[]
  getCellHighlightColor?: (item: TableRowWithDataAndFunctions<ItemType>, key: string) => string
} & Omit<TablePropTypes<ItemType>, 'items'>

const FilteredResponseTable = observer(
  <ItemType extends TableItemType>({
    data,
    columnLabels,
    loading = false,
    tableState,
    groupBy: groupByFn,
    transformItems = (items) => items,
    getCellHighlightColor,
    ...tableProps
  }: PropTypes<ItemType>) => {
    let { filters = [], sort = [], setFilters = () => {}, setSort = () => {} } = tableState
    const renderCellValue = useRenderCellValue()

    let itemGroups = useMemo(() => {
      let rows = data?.rows || []

      if (!groupByFn) {
        return { default: rows }
      }

      return groupBy(rows, groupByFn)
    }, [data, groupByFn])

    // Return columnLabels only for props that exist.
    let existingPropLabels = useMemo(() => {
      let modelGroup = itemGroups[Object.keys(itemGroups)[0]] || []
      let existingProps = Object.keys(modelGroup[0] || {})

      if (existingProps.length !== 0) {
        return pick(columnLabels, existingProps)
      }

      return columnLabels
    }, [columnLabels, itemGroups])

    return (
      <TableViewWrapper>
        <LoadingDisplay loading={loading} style={{ top: '-1rem' }} />
        <TableFiltersControl
          filters={filters}
          setFilters={setFilters}
          fieldLabels={columnLabels}
          excludeFields={['id', '__typename']}
        />
        {data?.filteredCount !== data?.totalCount && (
          <SmallHeading>
            <Text>table_filteredRows</Text> <strong>{data?.filteredCount || 0}</strong>
          </SmallHeading>
        )}
        {Object.entries(itemGroups).map(([groupName, items]) => (
          <React.Fragment key={groupName}>
            {groupName && groupName !== 'default' && (
              <SubHeading style={{ marginBottom: 0 }}>{groupName}</SubHeading>
            )}
            <PagedTable<ItemType>
              {...tableProps}
              items={transformItems(items)}
              totalCount={items.length}
              hideKeys={tableProps.hideKeys || (!columnLabels ? ['id'] : undefined)}
              renderValue={tableProps.renderValue || renderCellValue}
              sort={sort}
              setSort={setSort}
              columnLabels={existingPropLabels}
              getCellHighlightColor={getCellHighlightColor}>
              <TableEmptyView>
                <Text>tableEmpty</Text>
              </TableEmptyView>
            </PagedTable>
          </React.Fragment>
        ))}
      </TableViewWrapper>
    )
  }
)

export default FilteredResponseTable
