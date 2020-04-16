import React, { useCallback, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { Season } from '../../schema-types'
import { parseISO } from 'date-fns'
import { orderBy } from 'lodash'
import Dropdown from './Dropdown'
import { useSeasons } from '../../util/useSeasons'

export type PropTypes = {
  label?: string | null
  className?: string
  theme?: 'light' | 'dark'
  value: null | Season | string
  onSelect: (season: null | Season) => void
  selectInitialId?: string
}

const UNSELECTED_VAL = '...'

const valueIsSeason = (value: null | Season | string): value is Season =>
  !!value && typeof value !== 'string' && typeof value?.id !== 'undefined'

const SelectSeason: React.FC<PropTypes> = observer(
  ({ onSelect, value = null, label, className, theme = 'light', selectInitialId }) => {
    let seasonsData = useSeasons()

    const seasons: Season[] = useMemo(() => {
      // Most current seasons first
      const seasonsList: Season[] = orderBy(
        !seasonsData ? [] : [...seasonsData],
        ({ startDate }) => parseISO(startDate).getTime(),
        'desc'
      )

      if (seasonsList[0]?.id !== '...') {
        const unselectedSeason: Season = {
          id: UNSELECTED_VAL,
          season: '',
          startDate: '',
          endDate: '',
          preInspections: [],
        }
        seasonsList.unshift(unselectedSeason)
      }

      if (valueIsSeason(value) && !seasonsList.find((s) => s?.id === value?.id)) {
        seasonsList.push(value)
      }

      return seasonsList
    }, [seasonsData, value])

    const onSelectSeason = useCallback(
      (selectedItem) => {
        let selectValue = selectedItem

        if (!selectedItem || selectedItem?.id === UNSELECTED_VAL) {
          selectValue = null
        }

        onSelect(selectValue)
      },
      [onSelect]
    )

    // Auto-select the first season if there is only one.
    useEffect(() => {
      let initialSeasonId = selectInitialId || typeof value === 'string' ? value : ''
      let initialSeason = seasons.find((s) => s.id === initialSeasonId)

      // If no value or if we got a string value
      if ((!value || typeof value === 'string') && initialSeason) {
        onSelect(initialSeason)
      }

      if (!value && !initialSeason && seasons.length !== 0) {
        onSelect(seasons.find((season) => season.id !== UNSELECTED_VAL) || null)
      }
    }, [value, seasons, onSelect, selectInitialId])

    const currentSeason = useMemo(() => {
      if (!!value && typeof value === 'string') {
        return seasons.find((s) => s.id === value)
      }

      return value || seasons[0]
    }, [seasons, value])

    return (
      <Dropdown
        className={className}
        theme={theme}
        label={!label ? '' : label || 'Aikataulukausi'}
        items={seasons}
        onSelect={onSelectSeason}
        selectedItem={currentSeason}
        itemToString="id"
        itemToLabel="id"
      />
    )
  }
)

export default SelectSeason
