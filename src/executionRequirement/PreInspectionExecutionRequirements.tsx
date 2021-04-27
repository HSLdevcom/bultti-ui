import React, { useContext } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Button } from '../common/components/buttons/Button'
import RequirementsTable from './RequirementsTable'
import { LoadingDisplay } from '../common/components/Loading'
import { InspectionContext } from '../inspection/InspectionContext'
import { MessageView } from '../common/components/Messages'
import ExpandableSection, { HeaderMainHeading } from '../common/components/ExpandableSection'
import {
  RequirementsTableLayout,
  usePreInspectionAreaRequirements,
} from './executionRequirementUtils'
import { Text } from '../util/translate'

const AreaWrapper = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const AreaHeading = styled.h4`
  margin-bottom: 0;
  margin-top: 0;
`

export type PropTypes = {
  isValid: boolean
}

const PreInspectionExecutionRequirements: React.FC<PropTypes> = observer(
  ({ isValid = false }) => {
    let { inspection } = useContext(InspectionContext)
    let { id } = inspection || {}

    let {
      data: areaExecutionRequirements,
      loading: requirementsLoading,
      refetch,
    } = usePreInspectionAreaRequirements(id)

    return (
      <ExpandableSection
        error={!isValid}
        headerContent={
          <HeaderMainHeading>
            <Text>executionRequirements</Text>
          </HeaderMainHeading>
        }>
        {!requirementsLoading && areaExecutionRequirements?.length === 0 && (
          <>
            <MessageView>
              <Text>preInspection_noCalculatedExecutionRequirements</Text>
            </MessageView>
            <div>
              <Button onClick={refetch}>
                <Text>preInspection_calculateExecutionRequirements</Text>
              </Button>
            </div>
          </>
        )}
        <LoadingDisplay loading={requirementsLoading} style={{ top: '0' }} />
        {areaExecutionRequirements.map((areaRequirement) => (
          <AreaWrapper key={areaRequirement.area.id}>
            <AreaHeading>{areaRequirement.area.name}</AreaHeading>
            <RequirementsTable
              tableLayout={RequirementsTableLayout.BY_VALUES}
              executionRequirement={areaRequirement}
            />
          </AreaWrapper>
        ))}
      </ExpandableSection>
    )
  }
)

export default PreInspectionExecutionRequirements
