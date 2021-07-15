import {
  EditValue,
  findEmptyKeys,
  TableItemType,
  TableRowWithDataAndFunctions,
} from './tableUtils'
import { useMemo } from 'react'
import { orderBy } from 'lodash'
import { useTableColumns } from './useTableColumns'
import { ValueOf } from '../../type/common'

export function useTableRows<ItemType extends TableItemType>({
  items,
  pendingValues,
  editableValues,
  onRemoveRow,
  keyFromItem,
  onEditValue,
  isAlwaysEditable,
  hideKeys,
  columnLabels,
  columnOrder,
}: {
  items: ItemType[]
  keyFromItem: (item: ItemType) => string
  columnLabels?: { [key in keyof ItemType]?: string }
  columnOrder?: string[]
  hideKeys?: string[]
  onRemoveRow?: (item: ItemType) => unknown
  onEditValue?: <K extends keyof ItemType>(
    key: K,
    value: ItemType[K],
    item: ItemType
  ) => unknown
  pendingValues?: EditValue<ItemType>[]
  editableValues?: (keyof ItemType)[] | ((item: ItemType) => (keyof ItemType)[])
  isAlwaysEditable?: boolean
}) {
  let { columnNames, keysToHide, columnKeysOrdering, columns } = useTableColumns({
    items,
    columnOrder,
    columnLabels,
    hideKeys,
  })

  let rows: TableRowWithDataAndFunctions<ItemType>[] = useMemo(() => {
    let emptyKeys = findEmptyKeys(items)

    return items.map((item) => {
      let itemEntries = Object.entries(item) as [string, ValueOf<ItemType>][]

      // This filtering needs to match the columns filtering done in useTableColumns().
      itemEntries = itemEntries.filter(
        ([key]) =>
          !emptyKeys.includes(key) && !key.startsWith('_') && !keysToHide.includes(key)
      )

      if (columnKeysOrdering.length !== 0) {
        itemEntries = orderBy(itemEntries, ([key]) => {
          const labelIndex = columnKeysOrdering.indexOf(key)
          return labelIndex === -1 ? 999 : labelIndex
        })
      }

      const rowKey = keyFromItem(item)

      let isEditingRow: boolean =
        isAlwaysEditable ||
        (!!pendingValues && pendingValues.map((val) => keyFromItem(val.item)).includes(rowKey))

      const onMakeEditable = (key: keyof ItemType, val: ValueOf<ItemType>) => {
        let itemEditableValues =
          typeof editableValues === 'function'
            ? editableValues(item) // Some columns may be editable on a per-item basis.
            : Array.isArray(editableValues)
            ? editableValues
            : []

        if (!isEditingRow && onEditValue && itemEditableValues.includes(key as string)) {
          onEditValue(key, val, item)
        }
      }

      const onValueChange = (key) => (nextValue) => {
        if (isEditingRow && onEditValue) {
          onEditValue(key, nextValue, item)
        }
      }

      return {
        key: rowKey,
        isEditingRow: isAlwaysEditable ? false : isEditingRow,
        onRemoveRow,
        onMakeEditable,
        onValueChange,
        itemEntries,
        item,
      }
    })
  }, [
    items,
    pendingValues,
    editableValues,
    onRemoveRow,
    keyFromItem,
    columnKeysOrdering,
    onEditValue,
    isAlwaysEditable,
  ])

  return {
    columnNames,
    columns,
    rows,
  }
}
