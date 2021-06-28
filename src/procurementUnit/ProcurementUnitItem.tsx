import React from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import {
  Contract,
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
import { getDateObject } from '../util/formatDate'
import { isWithinInterval } from 'date-fns'

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
  contractSelectionDate: Date
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
    contractSelectionDate,
  }) => {
    const { currentContracts = [], routes = [] } = procurementUnit || {}

    let requirementsInvalid = validationErrors.some(
      (err) => err.type === InspectionValidationError.MissingExecutionRequirements
    )

    let catalogueInvalid = validationErrors.some(
      (err) =>
        err.type === InspectionValidationError.MissingEquipmentCatalogues ||
        err.type === InspectionValidationError.MissingRequirementVehicles
    )

    let contractInvalid = validationErrors.some((err) =>
      [
        InspectionValidationError.InvalidContracts,
        InspectionValidationError.MissingContracts,
      ].includes(err.type)
    )

    const procurementUnitAreaName = procurementUnit?.area?.name
      ? procurementUnit?.area?.name
      : OperatingAreaName.Unknown

    // The logic behind finding displayed contractUnit: selecting the latest contract that is currently valid
    // meaning if there are multiple contracts being valid, we select the one with the latest startDate
    let displayedContractUnit = currentContracts
      ? currentContracts
          .slice()
          .filter((contract: Contract) => {
            return isWithinInterval(contractSelectionDate, {
              start: getDateObject(contract.startDate),
              end: getDateObject(contract.endDate),
            })
          })
          .sort((a: Contract, b: Contract) => {
            return getDateObject(a.startDate).getTime() < getDateObject(b.startDate).getTime()
              ? 1
              : -1
          })[0]
      : undefined
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
                    <Text>contracts</Text> ({(currentContracts || []).length})
                  </HeaderHeading>
                  {displayedContractUnit ? (
                    <>
                      <DateRangeDisplay
                        startDate={displayedContractUnit.startDate}
                        endDate={displayedContractUnit.endDate}
                      />
                      <ContractDescription>
                        {displayedContractUnit.description}
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
                displayedContractUnitId={
                  displayedContractUnit ? displayedContractUnit.id : undefined
                }
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
