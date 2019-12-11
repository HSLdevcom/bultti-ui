import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useSelect } from 'downshift'
import { text } from '../utils/translate'
import { Button, ButtonSize } from '../components/Button'
import { ArrowDown } from '../icons/ArrowDown'
import { ThemeTypes } from '../types/common'
import { InputLabel } from '../components/common'

const DropdownView = styled.div``

const SelectWrapper = styled.div`
  position: relative;
`

const SelectButton = styled(Button).attrs({ size: ButtonSize.MEDIUM })<{
  theme: ThemeTypes
}>`
  background: ${(p) => (p.theme === 'light' ? '#fafafa' : 'white')};
  color: var(--dark-grey);
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme === 'light' ? '#eaeaea' : 'var(--dark-blue)')};
  font-size: 1rem;
  justify-content: flex-start;

  svg {
    display: block;
    margin-left: auto;
  }

  &:hover {
    background: ${(p) => (p.theme === 'light' ? 'white' : 'var(--lighter-grey)')};
    color: var(--dark-grey);
    border-color: var(--blue);

    svg * {
      fill: ${(p) => (p.theme === 'light' ? 'var(--blue)' : 'var(--dark-grey)')};
    }
  }
`

const SuggestionsList = styled.ul<{ isOpen: boolean; theme: ThemeTypes }>`
  list-style: none;
  width: 100%;
  border-radius: 8px;
  background: ${(p) => (p.theme === 'light' ? 'white' : 'var(--dark-grey)')};
  max-height: 265px;
  overflow-y: auto;
  position: absolute;
  z-index: 10;
  outline: 0;
  top: -1rem;
  left: 0;
  padding: 0;
  border: 1px solid ${(p) => (p.theme === 'light' ? 'var(--blue)' : 'var(--dark-blue)')};
  opacity: ${(p) => (p.isOpen ? 1 : 0)};
`

const OperatorSuggestion = styled.li<{ highlighted: boolean }>`
  color: ${(p) =>
    p.highlighted ? 'white' : p.theme === 'light' ? 'var(--dark-grey)' : 'white'};
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: ${(p) => (p.highlighted ? 'var(--dark-blue)' : 'transparent')};
`

export type DropdownProps<T = any> = {
  label: string
  items: T[]
  onSelect: (selectedItem: T | null) => unknown
  itemToString: string | ((item: T | null) => string)
  itemToLabel: string | ((item: T | null) => string)
  selectedItem?: T
  className?: string
  theme?: 'light' | 'dark'
}

function toString(item, converter) {
  if (item && typeof converter === 'string') {
    return item[converter]
  }

  if (typeof converter === 'function') {
    return converter(item)
  }

  return ''
}

const Dropdown: React.FC<any> = <T extends {}>({
  className,
  label,
  items,
  onSelect,
  selectedItem,
  itemToString = 'id',
  itemToLabel = 'label',
  theme = 'light',
}: DropdownProps<T>) => {
  const onSelectFn = useCallback(
    ({ selectedItem = null }) => {
      onSelect(selectedItem || null)
    },
    [onSelect]
  )

  const {
    isOpen,
    selectedItem: currentlySelected,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect<T>({
    items,
    onSelectedItemChange: onSelectFn,
    selectedItem,
    defaultSelectedItem: items[0],
    itemToString: (item: T) => toString(item, itemToString),
  })

  return (
    <DropdownView className={className} theme={theme}>
      {!!label && (
        <InputLabel {...getLabelProps()} htmlFor="null" theme={theme}>
          {label}
        </InputLabel>
      )}
      <SelectWrapper>
        <SelectButton {...getToggleButtonProps()} theme={theme}>
          {toString(currentlySelected, itemToLabel) || text('general.app.all')}
          <ArrowDown fill="var(--dark-grey)" width="1rem" height="1rem" />
        </SelectButton>
        <SuggestionsList {...getMenuProps()} theme={theme} isOpen={isOpen}>
          {isOpen
            ? items.map((item, index) => (
                <OperatorSuggestion
                  theme={theme}
                  highlighted={highlightedIndex === index}
                  {...getItemProps({
                    key: toString(item, itemToString),
                    index,
                    item,
                  })}>
                  {toString(item, itemToLabel)}
                </OperatorSuggestion>
              ))
            : null}
        </SuggestionsList>
      </SelectWrapper>
    </DropdownView>
  )
}

export default Dropdown
