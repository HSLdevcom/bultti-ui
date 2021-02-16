import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import Input from '../input/Input'
import { omit } from 'lodash'
import { ControlGroup } from '../components/form'
import Dropdown from '../input/Dropdown'
import { Button, ButtonSize, ButtonStyle, RemoveButton } from '../components/Button'
import { text, Text } from '../../util/translate'
import { FlexRow } from '../components/common'
import { SubHeading } from '../components/Typography'
import { FilterConfig } from '../../schema-types'
import UserHint from '../components/UserHint'

const TableFiltersView = styled.div`
  margin: 1rem 0 0;
  padding: 1rem;
  background: var(--white-grey);
  border-radius: 1rem;
`

const FilterButtonBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const FilterButtonsWrapper = styled.div`
  margin-left: auto;
  align-self: flex-end;
  margin-bottom: 0.875rem;
  flex: 0;
`

export type PropTypes<ItemType = any> = {
  onApply: () => unknown
  excludeFields?: string[]
  fieldLabels?: { [key in keyof ItemType]?: string }
  filters: FilterConfig[]
  setFilters: (arg: ((filters: FilterConfig[]) => FilterConfig[]) | FilterConfig[]) => unknown
}

const TableFiltersControl = observer(
  <ItemType extends {}>({
    excludeFields = [],
    fieldLabels = {},
    onApply = () => {},
    filters,
    setFilters,
  }: PropTypes<ItemType>) => {
    let onAddFilter = useCallback((field = '') => {
      setFilters((currentFilters) => {
        let newFilter: FilterConfig = {
          field,
          filterValue: '',
        }
        return [...currentFilters, newFilter]
      })
    }, [])

    let onChangeFilter = useCallback((index: number, value: string) => {
      setFilters((currentFilters) => {
        let nextFilters = [...currentFilters]
        let filterConfig = nextFilters[index]

        if (filterConfig) {
          filterConfig.filterValue = value
          return nextFilters
        }

        return currentFilters
      })
    }, [])

    let onChangeFilterField = useCallback(
      (index, setField: { field: string; label: string }) => {
        if (!setField) {
          return
        }

        setFilters((currentFilters) => {
          let nextFilters = [...currentFilters]
          let filterConfig = nextFilters[index]

          if (filterConfig) {
            filterConfig.field = setField.field
            return nextFilters
          }

          return currentFilters
        })
      },
      []
    )

    let onRemoveFilter = useCallback((index) => {
      setFilters((currentFilters) => {
        let nextFilters = [...currentFilters]
        let removed = nextFilters.splice(index, 1)

        if (removed.length !== 0) {
          return nextFilters
        }

        return currentFilters
      })
    }, [])

    let currentFilters = useRef<FilterConfig[]>([])

    let onClickApply = useCallback(() => {
      currentFilters.current = filters
      onApply()
    }, [filters, onApply])

    useEffect(() => {
      if (currentFilters.current.length !== 0 && filters.length === 0) {
        onClickApply()
      }
    }, [currentFilters.current, filters, onClickApply])

    let filterFieldOptions = useMemo(() => {
      let fields = omit(fieldLabels, excludeFields)

      let options = Object.keys(fields).map((key) => ({
        field: key,
        label: fieldLabels[key] || key,
      }))

      return [{ field: '', label: 'Kaikki' }, ...options]
    }, [fieldLabels, excludeFields])

    return (
      <TableFiltersView>
        <FlexRow style={{ alignItems: 'center' }}>
          <SubHeading style={{ marginTop: 0, marginBottom: 0 }}>
            <Text>report_filtering_title</Text>
            <UserHint
              hintText={text('report_filtering_hint')}
              style={{ marginLeft: '0.75rem' }}
            />
          </SubHeading>
          <Button
            style={{ marginLeft: 'auto' }}
            onClick={() => onAddFilter()}
            buttonStyle={ButtonStyle.SECONDARY}
            size={ButtonSize.SMALL}>
            <Text>report_filtering_addField</Text>
          </Button>
        </FlexRow>
        {filters.length !== 0 && (
          <>
            <FlexRow style={{ marginTop: '1.5rem', flexDirection: 'column' }}>
              {filters.map((filterConfig, index) => {
                let selectedFilterOption = filterFieldOptions.find(
                  (f) => f.field === filterConfig.field
                )

                return (
                  <ControlGroup
                    key={`${filterConfig.field}_${index}`}
                    style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <Input
                      value={filterConfig.filterValue}
                      onChange={(nextVal) => onChangeFilter(index, nextVal)}
                      name="filter"
                      type="text"
                      theme="light"
                      label={`${text('report_filtering_filter_on')} ${
                        selectedFilterOption?.label || text('all')
                      }`}
                    />
                    {filterFieldOptions.length !== 0 && (
                      <Dropdown
                        label={text('field')}
                        items={filterFieldOptions}
                        selectedItem={selectedFilterOption}
                        itemToString={(item) => item.field}
                        itemToLabel={(item) => item.label}
                        onSelect={(nextField) => onChangeFilterField(index, nextField)}
                      />
                    )}
                    <FilterButtonsWrapper>
                      <RemoveButton onClick={() => onRemoveFilter(index)} />
                    </FilterButtonsWrapper>
                  </ControlGroup>
                )
              })}
            </FlexRow>
            <FlexRow>
              {filters.length !== 0 && (
                <FilterButtonBar>
                  <Button size={ButtonSize.LARGE} onClick={onClickApply}>
                    <Text>report_filtering_apply</Text>
                  </Button>
                </FilterButtonBar>
              )}
            </FlexRow>
          </>
        )}
      </TableFiltersView>
    )
  }
)

export default TableFiltersControl