import React, { useMemo } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useStateValue } from '../state/useAppState'
import { useFetchInspections } from './inspectionUtils'
import { Inspection, InspectionStatus } from '../schema-types'
import DateRangeDisplay from '../common/components/DateRangeDisplay'
import { InputLabel } from '../common/components/form'
import { ArrowRight } from '../common/icon/ArrowRight'
import { format, parseISO, isBefore } from 'date-fns'
import { READABLE_DATE_FORMAT } from '../constants'
import { orderBy } from 'lodash'

const InspectionTimelineView = styled.div`
  margin: 1rem 0;
`

const InspectionTimeLineItem = styled.div`
  border: 2px dashed transparent;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  background: var(--green);
  color: white;
  font-size: 0.875rem !important;
  margin-right: 0.5rem;
  white-space: nowrap;
`
const InspectionDates = styled(DateRangeDisplay)`
  margin-top: 0.5rem;
  flex-wrap: nowrap;
`

const TimelineStart = styled(InspectionTimeLineItem)`
  background: var(--grey);

  strong {
    font-size: 1rem;
    margin-top: 0.5rem;
    display: block;
  }
`

const TimelineEnd = styled(InspectionTimeLineItem)<{ isProduction: boolean }>`
  border: 2px ${(p) => (p.isProduction ? 'solid transparent' : 'dashed var(--light-grey)')};
  background: ${(p) => (p.isProduction ? 'var(--green)' : 'white')};
  color: ${(p) => (p.isProduction ? 'white' : 'var(--light-grey)')}; ;
`

const TimelineWrapper = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
  }
`

export type PropTypes = {
  currentInspection: Inspection
}

const InspectionTimeline = observer(({ currentInspection }: PropTypes) => {
  var [operator] = useStateValue('globalOperator')
  var [season] = useStateValue('globalSeason')

  let [{ inspections }] = useFetchInspections(currentInspection.inspectionType, operator)

  let previousProdInspections = useMemo(
    () =>
      orderBy(
        inspections.filter(
          (inspection) =>
            inspection.status === InspectionStatus.InProduction &&
            inspection.id !== currentInspection.id &&
            isBefore(
              parseISO(inspection.inspectionStartDate),
              parseISO(currentInspection.startDate)
            )
        ),
        'inspectionStartDate',
        'asc'
      ),
    [inspections]
  )

  let arrow = <ArrowRight fill="var(--light-grey)" width="1.5rem" height="1.5rem" />

  let seasonStartElement = (
    <>
      <TimelineStart>
        Kauden alku
        <br />
        <strong>{format(parseISO(season.startDate), READABLE_DATE_FORMAT)}</strong>
      </TimelineStart>
      {arrow}
    </>
  )

  // The season start date needs to be rendered only once. This function ensures that.
  let renderSeasonStartOnce = useMemo(() => {
    let didRenderSeasonStart = false

    return () => {
      if (!didRenderSeasonStart) {
        didRenderSeasonStart = true
        return seasonStartElement
      }

      return null
    }
  }, [seasonStartElement])

  return (
    <InspectionTimelineView>
      <InputLabel theme="light">Edelliset tarkastusjaksot</InputLabel>
      <TimelineWrapper>
        {previousProdInspections.length === 0 && renderSeasonStartOnce()}
        {previousProdInspections.length !== 0 &&
          previousProdInspections.slice(-2).map((inspection) => (
            <>
              {isBefore(
                parseISO(season.startDate),
                parseISO(inspection.inspectionStartDate)
              ) && renderSeasonStartOnce()}
              <InspectionTimeLineItem key={inspection.id}>
                {`${inspection.operator.operatorName}/${inspection.seasonId}`}
                <InspectionDates
                  startDate={inspection.inspectionStartDate}
                  endDate={inspection.inspectionEndDate}
                />
              </InspectionTimeLineItem>
              {arrow}
            </>
          ))}
        {renderSeasonStartOnce()}
        <TimelineEnd isProduction={currentInspection.status === InspectionStatus.InProduction}>
          Tämä tarkastus
          <InspectionDates
            startDate={currentInspection.inspectionStartDate}
            endDate={currentInspection.inspectionEndDate}
          />
        </TimelineEnd>
      </TimelineWrapper>
    </InspectionTimelineView>
  )
})

export default InspectionTimeline
