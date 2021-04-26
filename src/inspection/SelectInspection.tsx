import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Inspection, InspectionStatus, InspectionType } from '../schema-types'
import { orderBy } from 'lodash'
import { FlexRow } from '../common/components/common'
import { useStateValue } from '../state/useAppState'
import {
  getInspectionStatusColor,
  getInspectionStatusName,
  getInspectionTypeStrings,
  useCreateInspection,
  useNavigateToInspection,
} from './inspectionUtils'
import { MessageContainer, MessageView } from '../common/components/Messages'
import { SubHeading } from '../common/components/Typography'
import InspectionActions from './InspectionActions'
import { Plus } from '../common/icon/Plus'
import { LoadingDisplay } from '../common/components/Loading'
import { getReadableDate } from '../util/formatDate'

const SelectInspectionView = styled.div`
  position: relative;
`

const InspectionItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 0 1rem 0 0;
`

const HeaderRow = styled(FlexRow)`
  padding: 0 1rem;
  min-height: 35px;
  align-items: center;
`

const ListHeading = styled.h4`
  margin: 0 1rem 0 0;
`

type StatusProps = { status?: InspectionStatus }

const InspectionItem = styled.div<StatusProps>`
  padding: 0.75rem 1rem 0;
  border-radius: 5px;
  margin-bottom: 1rem;
  background: white;
  border: 2px solid ${(p) => getInspectionStatusColor(p.status)};
  font-family: inherit;
  margin-left: 1rem;
  text-align: left;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  flex: 0 0 25rem;
`

const NewInspection = styled.button`
  background: white;
  border: 3px dashed var(--lighter-grey);
  border-radius: 1rem;
  font-family: inherit;
  padding: 1rem;
  font-weight: bold;
  color: var(--light-grey);
  font-size: 1.5rem;
  margin-left: 1rem;
  margin-bottom: 1rem;
  flex: 0 0 25rem;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.1s ease-out;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
  outline: 0;
  min-height: 13.3rem;

  * {
    margin: 0;
  }

  &:hover {
    box-shadow: 0 0 15px 3px rgba(0, 0, 0, 0.1);
    border-color: var(--light-grey);
  }
`

const ItemContent = styled.div`
  line-height: 1.4;
  position: relative;
`

const InspectionTitle = styled(SubHeading)`
  margin-bottom: 0.75rem;
`

const InspectionSubtitle = styled(SubHeading)`
  margin-top: -0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
`

const InspectionVersion = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
  background: var(--lighter-grey);
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`

const InspectionStatusDisplay = styled.div<StatusProps>`
  padding: 0.25rem 0;
  text-align: center;
  background: ${(p) => getInspectionStatusColor(p.status)};
  color: ${(p) => (p.status === InspectionStatus.InReview ? 'var(--dark-grey)' : 'white')};
  margin: 0 0 1rem;
  border-radius: 5px;
`

const InspectionPeriodDisplay = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0.5rem;
  }
`

const StartDate = styled.span`
  margin-right: 0.75rem;

  &:after {
    content: '➔';
    display: inline-block;
    margin-left: 0.75rem;
  }
`

const EndDate = styled(StartDate)`
  &:after {
    content: '';
  }
`

const DateTitle = styled.h6`
  font-size: 0.75rem;
  margin-top: 0;
  margin-bottom: 0.25rem;
`

export type PropTypes = {
  inspections?: Inspection[]
  inspectionType: InspectionType
  refetchInspections: () => unknown
  loading?: boolean
}

/**
 * - Display current in-production pre-inspection
 * - Display current draft pre-inspection
 * - Create a new pre-inspection draft (if no pre-inspection exists for the operator/season combo)
 * - Create a new pre-inspection draft that extends the in-production version
 * - Delete the current draft
 */

const SelectInspection: React.FC<PropTypes> = observer(
  ({ inspections = [], inspectionType, refetchInspections, loading = false }) => {
    var [season] = useStateValue('globalSeason')
    var [operator] = useStateValue('globalOperator')

    var navigateToInspection = useNavigateToInspection(inspectionType)

    // Initialize the form by creating a pre-inspection on the server and getting the ID.
    let createInspection = useCreateInspection(operator, season, inspectionType)

    let onCreateInspection = useCallback(async () => {
      let createdInspection = await createInspection()

      if (createdInspection) {
        navigateToInspection(createdInspection)
      }

      await refetchInspections()
    }, [createInspection, refetchInspections, navigateToInspection])

    let typeStrings = getInspectionTypeStrings(inspectionType)

    return (
      <SelectInspectionView>
        <LoadingDisplay loading={loading} />
        {!operator || !season ? (
          <MessageContainer>
            <MessageView>Valitse liikennöitsijä ja kausi.</MessageView>
          </MessageContainer>
        ) : (
          <>
            <HeaderRow>
              <ListHeading>
                {operator.operatorName} / {typeof season === 'string' ? season : season?.id}
              </ListHeading>
            </HeaderRow>
            <InspectionItems>
              <NewInspection onClick={onCreateInspection}>
                <ItemContent>
                  <Plus fill="var(--lighter-grey)" width="4rem" height="4rem" />
                </ItemContent>
                <ItemContent style={{ marginTop: 0 }}>
                  Luo uusi {typeStrings.prefixLC}tarkastus
                </ItemContent>
              </NewInspection>
              {orderBy(inspections, 'version', 'desc').map((inspection) => (
                <InspectionItem key={inspection.id} status={inspection.status}>
                  <ItemContent>
                    {inspection.name ? (
                      <>
                        <InspectionTitle>{inspection.name}</InspectionTitle>
                        <InspectionSubtitle>
                          {inspection.operator.operatorName}, {inspection.seasonId}
                        </InspectionSubtitle>
                      </>
                    ) : (
                      <InspectionTitle>
                        {inspection.operator.operatorName}, {inspection.seasonId}
                      </InspectionTitle>
                    )}
                    <InspectionVersion>{inspection.version}</InspectionVersion>
                    <InspectionStatusDisplay status={inspection.status}>
                      {getInspectionStatusName(inspection.status)}
                    </InspectionStatusDisplay>
                    <InspectionPeriodDisplay>
                      <DateTitle>Tuotantojakso</DateTitle>
                      <StartDate>{getReadableDate(inspection.startDate)}</StartDate>
                      <EndDate>{getReadableDate(inspection.endDate)}</EndDate>
                    </InspectionPeriodDisplay>
                    <InspectionPeriodDisplay>
                      <DateTitle>Tarkastusjakso</DateTitle>
                      <StartDate>{getReadableDate(inspection.inspectionStartDate)}</StartDate>
                      <EndDate>{getReadableDate(inspection.inspectionEndDate)}</EndDate>
                    </InspectionPeriodDisplay>
                  </ItemContent>
                  <InspectionActions onRefresh={refetchInspections} inspection={inspection} />
                </InspectionItem>
              ))}
            </InspectionItems>
          </>
        )}
      </SelectInspectionView>
    )
  }
)

export default SelectInspection
