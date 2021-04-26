import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useStateValue } from '../../state/useAppState'
import SelectSeason from '../input/SelectSeason'
import { getUrlValue } from '../../util/urlValue'
import { getReadableDateRange } from '../../util/formatDate'
import styled from 'styled-components/macro'
import { text } from '../../util/translate'
import { Season } from '../../schema-types'
import { SidebarStyledDropdown } from './SidebarStyledDropdown'

const SeasonTimeSpan = styled.div`
  padding-top: 0.2rem;
  font-size: 0.8rem;
  margin-left: 1rem;
`

const GlobalSeasonFilter: React.FC = observer(() => {
  const [season, setSeasonFilter] = useStateValue<Season>('globalSeason')

  let initialSeasonId: string | undefined = useMemo(() => {
    let initialVal = (getUrlValue('season') || '') + ''
    return initialVal || undefined
  }, [])

  return (
    <React.Fragment>
      <SidebarStyledDropdown
        as={SelectSeason}
        onSelect={setSeasonFilter}
        value={season}
        label={text('selectSeason')}
        selectInitialId={initialSeasonId}
      />
      {season && (
        <SeasonTimeSpan>
          {getReadableDateRange({ start: season.startDate, end: season.endDate })}
        </SeasonTimeSpan>
      )}
    </React.Fragment>
  )
})

export default GlobalSeasonFilter
