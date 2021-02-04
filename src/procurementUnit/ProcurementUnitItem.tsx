import React from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import {
  InspectionValidationError,
  OperatingAreaName,
  ProcurementUnit as ProcurementUnitType,
  ValidationErrorData,
} from '../schema-types'
import ExpandableSection, {
  HeaderHeading,
  HeaderSection,
} from '../common/components/ExpandableSection'
import DateRangeDisplay from '../common/components/DateRangeDisplay'
import ProcurementUnitItemContent from './ProcurementUnitItemContent'
import { text, Text } from '../util/translate'

const ProcurementUnitView = styled.div<{ error?: boolean }>`
  position: relative;
`

const ContractDescription = styled.div`
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

export type PropTypes = {
  procurementUnit: ProcurementUnitType
  expanded?: boolean
  startDate: string
  endDate: string
  catalogueEditable: boolean
  requirementsEditable: boolean
  showExecutionRequirements: boolean
  className?: string
  validationErrors: ValidationErrorData[]
}

const operatingAreaNameLocalizationObj = {
  [OperatingAreaName.Center]: text('center'),
  [OperatingAreaName.Other]: text('other'),
  [OperatingAreaName.Unknown]: text('unknown'),
}

const ProcurementUnitItem: React.FC<PropTypes> = observer(
  ({
    catalogueEditable,
    requirementsEditable,
    showExecutionRequirements,
    startDate,
    endDate,
    procurementUnit,
    expanded = true,
    className,
    validationErrors = [],
  }) => {
    const { currentContracts = [], routes = [] } = procurementUnit || {}

    let requirementsInvalid = validationErrors.some(
      (err) => err.type === InspectionValidationError.MissingExecutionRequirements
    )

    let catalogueInvalid = validationErrors.some(
      (err) => err.type === InspectionValidationError.MissingEquipmentCatalogues
    )

    let contractInvalid = validationErrors.some((err) =>
      [
        InspectionValidationError.ContractOutsideInspectionTime,
        InspectionValidationError.MissingContracts,
      ].includes(err.type)
    )

    const procurementUnitAreaName = procurementUnit?.area?.name
      ? procurementUnit?.area?.name
      : OperatingAreaName.Unknown

    return (
      <ProcurementUnitView className={className}>
        {procurementUnit && (
          <ExpandableSection
            unmountOnClose={true}
            error={validationErrors.length !== 0}
            isExpanded={expanded}
            headerContent={
              <>
                <HeaderSection>
                  <HeaderHeading>
                    <Text>procurementUnit_unitId</Text>
                  </HeaderHeading>
                  {procurementUnit.procurementUnitId}
                </HeaderSection>
                <HeaderSection>
                  <HeaderHeading>
                    <Text>routes</Text>
                  </HeaderHeading>
                  {(routes || [])
                    .map((route) => route?.routeId)
                    .filter((routeId) => !!routeId)
                    .join(', ')}
                </HeaderSection>
                <HeaderSection style={{ flexGrow: 2 }}>
                  <HeaderHeading>
                    <Text>procurementUnit_unitValidTime</Text>
                  </HeaderHeading>
                  <DateRangeDisplay
                    startDate={procurementUnit.startDate}
                    endDate={procurementUnit.endDate}
                  />
                </HeaderSection>
                <HeaderSection>
                  <HeaderHeading>
                    <Text>procurementUnit_operationArea</Text>
                  </HeaderHeading>
                  {operatingAreaNameLocalizationObj[procurementUnitAreaName]}
                </HeaderSection>
                <HeaderSection>
                  <HeaderHeading>
                    <Text>procurementUnit_ageRequirement</Text>
                  </HeaderHeading>
                  {procurementUnit?.medianAgeRequirement || 0}{' '}
                  <Text>procurementUnit_ageRequirementYears</Text>
                </HeaderSection>
                <HeaderSection style={{ flexGrow: 2 }} error={contractInvalid}>
                  <HeaderHeading>
                    <Text>contracts</Text>
                  </HeaderHeading>
                  {(currentContracts || []).length !== 0 ? (
                    <>
                      <DateRangeDisplay
                        startDate={currentContracts![0].startDate}
                        endDate={currentContracts![currentContracts!.length - 1].endDate}
                      />
                      <ContractDescription>
                        {currentContracts![0].description}
                      </ContractDescription>
                    </>
                  ) : (
                    text('procurementUnit_noValidContracts')
                  )}
                </HeaderSection>
              </>
            }>
            {(itemIsExpanded: boolean) => (
              <ProcurementUnitItemContent
                isVisible={itemIsExpanded}
                showExecutionRequirements={showExecutionRequirements}
                startDate={startDate}
                endDate={endDate}
                procurementUnitId={procurementUnit.id}
                requirementsEditable={requirementsEditable}
                catalogueEditable={catalogueEditable}
                catalogueInvalid={catalogueInvalid}
                requirementsInvalid={requirementsInvalid}
              />
            )}
          </ExpandableSection>
        )}
      </ProcurementUnitView>
    )
  }
)

export default ProcurementUnitItem
