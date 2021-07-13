import { Dictionary, difference, get, omitBy, orderBy } from 'lodash'
import { findEmptyKeys, TableItemType } from './tableUtils'
import { useMemo } from 'react'

export function useTableColumns<ItemType extends TableItemType>({
  items,
  columnLabels = {},
  columnOrder = [],
  hideKeys,
}: {
  items: ItemType[]
  columnLabels?: { [key in keyof ItemType]?: string }
  columnOrder?: string[]
  hideKeys?: string[]
}) {
  // Collect an array of keys that are empty for all items. These will be hidden.
  let emptyValues = useMemo(() => findEmptyKeys(items), [items])

  // Order the keys and get cleartext labels for the columns
  // Omit keys that start with an underscore or which are empty in all items.
  // This filtering needs to match the items filtering done in useTableRows().
  let columns = Object.keys(
    omitBy(
      (items[0] || columnLabels) as Dictionary<ItemType>,
      (val, key) => emptyValues.includes(key) || key.startsWith('_')
    )
  )

  const columnLabelKeys = Object.keys(columnLabels)

  const columnKeysOrdering =
    columnOrder && columnOrder.length !== 0 ? columnOrder : columnLabelKeys

  let keysToHide: string[] = []

  // Hide keys listed in hideKeys if hideKeys is a non-zero array.
  // Hide keys NOT listed in columnLabels if hideKeys is undefined.
  // If hideKeys is a zero-length array no keys will be hidden.
  if (hideKeys && hideKeys.length !== 0) {
    keysToHide = hideKeys
  } else if (!hideKeys && columnLabelKeys.length !== 0) {
    keysToHide = difference(columns, columnLabelKeys)
  }

  // Order the columns by the provided columnOrder
  if (columnKeysOrdering.length !== 0) {
    columns = orderBy(columns, (key) => {
      const labelIndex = columnKeysOrdering.indexOf(key)
      return labelIndex === -1 ? 999 : labelIndex
    }).filter((c) => !keysToHide.includes(c))
  }

  // Column name array for the header row
  let columnNames = columns.map((key) => [key, key])

  // Get user-facing names for the columns
  if (columnLabelKeys.length !== 0) {
    columnNames = columns.map((key) => [key, get(columnLabels, key, key)])
  }

  return {
    keysToHide,
    columnNames,
    columnKeysOrdering,
    columns,
  }
}
