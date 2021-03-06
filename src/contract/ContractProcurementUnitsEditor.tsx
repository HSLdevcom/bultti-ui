import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Contract, ContractInput, ProcurementUnitOption } from '../schema-types'
import { useQueryData } from '../util/useQueryData'
import { procurementUnitOptionsQuery } from './contractQueries'
import {
  HeaderBoldHeading,
  HeaderHeading,
  HeaderSection,
} from '../common/components/ExpandableSection'
import Checkbox from '../common/input/Checkbox'
import { MessageContainer, MessageView } from '../common/components/Messages'
import { LoadingDisplay } from '../common/components/Loading'
import DateRangeDisplay from '../common/components/DateRangeDisplay'
import { useContractPage } from './contractUtils'
import { TextButton } from '../common/components/buttons/Button'
import { FlexRow } from '../common/components/common'
import { text, Text } from '../util/translate'
import { areIntervalsOverlapping } from 'date-fns'
import { DEFAULT_DECIMALS } from '../constants'
import { getDateObject } from '../util/formatDate'

const ContractProcurementUnitsEditorView = styled.div``

const UnitContentWrapper = styled.div`
  overflow: hidden;
  position: relative;
`

const EmptyView = styled(MessageContainer)`
  border-top: 1px solid var(--lighter-grey);
`

const ProcurementUnitOptionContainer = styled.div`
  border-bottom: 1px solid var(--lighter-grey);
  border-radius: 0;
  background: white;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  &:last-child {
    border-bottom: 0;
  }
`

const CurrentContractDisplay = styled.div`
  margin-top: 0.75rem;
  font-size: 0.75rem;

  > * {
    margin-top: 0.25rem;
  }

  * {
    font-size: inherit;
  }
`

export type PropTypes = {
  readOnly: boolean
  contract: ContractInput
  onChange: (includedUnitIds: string[]) => unknown
}

const ContractProcurementUnitsEditor = observer(
  ({ contract, onChange, readOnly }: PropTypes) => {
    let includedUnitIds = useMemo(() => contract?.procurementUnitIds || [], [contract])

    let { data: procurementUnitOptions, loading: unitsLoading } = useQueryData<
      ProcurementUnitOption[]
    >(procurementUnitOptionsQuery, {
      skip: !contract || !contract?.operatorId || !contract?.startDate,
      variables: {
        operatorId: contract?.operatorId,
        startDate: contract?.startDate,
        endDate: contract?.endDate,
        contractId: contract?.id,
      },
    })

    let unitOptions = useMemo(() => procurementUnitOptions || [], [procurementUnitOptions])

    let onToggleUnitInclusion = useCallback(
      (unitId) => {
        let nextIncludedIds = [...includedUnitIds]

        if (nextIncludedIds.includes(unitId)) {
          let currentIdx = nextIncludedIds.findIndex((id) => id === unitId)
          nextIncludedIds.splice(currentIdx, 1)
        } else {
          nextIncludedIds.push(unitId)
        }

        onChange(nextIncludedIds)
      },
      [includedUnitIds, onChange]
    )

    let editContract = useContractPage()

    let allSelected = useMemo(
      () => !unitOptions.some((unit) => !includedUnitIds.includes(unit.id)),
      [unitOptions, includedUnitIds]
    )

    let onSelectAll = useCallback(() => {
      if (!allSelected) {
        let allSelectedArr = unitOptions.map((unit) => unit.id)
        onChange(allSelectedArr)
      } else {
        let unselectableUnitOptionIds = unitOptions
          .filter((unit) => unit.isUnselectingDisabled)
          .map((unit) => unit.id)
        onChange(unselectableUnitOptionIds)
      }
    }, [allSelected, unitOptions])

    return (
      <ContractProcurementUnitsEditorView>
        <UnitContentWrapper>
          <LoadingDisplay loading={unitsLoading} />
          {unitOptions.length === 0 && !unitsLoading && (
            <EmptyView>
              <MessageView>
                <Text>contract_procurementUnitsEditor_noProcurementUnits</Text>
              </MessageView>
            </EmptyView>
          )}
          <FlexRow
            style={{
              justifyContent: 'flex-end',
              padding: '0.75rem',
              borderBottom: '1px solid var(--lighter-grey)',
            }}>
            <Checkbox
              disabled={readOnly}
              value="select_all"
              name="select_all"
              label={allSelected ? text('allSelected') : text('selectAll')}
              checked={allSelected}
              onChange={onSelectAll}
            />
          </FlexRow>
          {unitOptions.map((unitOption) => {
            let routes = (unitOption.routes || []).filter((routeId) => !!routeId)

            let fullRoutesString = routes.join(', ')
            let shortRoutes = routes.slice(0, DEFAULT_DECIMALS)

            if (routes.length > shortRoutes.length) {
              shortRoutes.push('...')
            }

            let shortRoutesString = shortRoutes.join(', ')
            let isSelected = includedUnitIds.includes(unitOption.id)

            let currentContracts = unitOption.currentContracts || []

            let isCurrentContract = currentContracts.some((c) => c.id === contract.id)
            let overlappingWithExistingContract: Contract | undefined = undefined
            if (!isCurrentContract) {
              overlappingWithExistingContract = currentContracts.find((c) =>
                areIntervalsOverlapping(
                  {
                    start: getDateObject(c.startDate),
                    end: getDateObject(c.endDate),
                  },
                  {
                    start: getDateObject(contract.startDate || ''),
                    end: getDateObject(contract.endDate || ''),
                  }
                )
              )
            }

            return (
              <ProcurementUnitOptionContainer key={unitOption.id}>
                <HeaderBoldHeading style={{ flex: '1 0 10rem' }}>
                  {unitOption.name}
                </HeaderBoldHeading>
                <HeaderSection title={fullRoutesString}>
                  <HeaderHeading>
                    <Text>contract_procurementUnitsEditor_routes</Text>
                  </HeaderHeading>
                  {shortRoutesString}
                </HeaderSection>
                <HeaderSection>
                  <HeaderHeading>
                    <Text>validityPeriod</Text>
                  </HeaderHeading>
                  {unitOption.startDate} - {unitOption.endDate}
                </HeaderSection>
                <HeaderSection style={{ flex: '1 0 7rem' }}>
                  <HeaderHeading>
                    <Text>area</Text>
                  </HeaderHeading>
                  {unitOption?.areaName || 'OTHER'}
                </HeaderSection>
                <HeaderSection style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Checkbox
                    disabled={
                      readOnly ||
                      unitOption.isUnselectingDisabled ||
                      !!overlappingWithExistingContract
                    }
                    disabledMessage={
                      unitOption.isUnselectingDisabled
                        ? text('contract_procurementUnitsEditor_unselectingDisabled')
                        : !!overlappingWithExistingContract
                        ? `Nyt auki olevan sopimusehdon päivämäärät menevät päällekkäin kohteeseen jo liitettyjen sopimusehtojen ${overlappingWithExistingContract.startDate} - ${overlappingWithExistingContract.endDate} kanssa, joten sopimusehtoja ei voi liittää tähän kohteeseen.`
                        : undefined
                    }
                    value="unit_included"
                    name="unit_included"
                    label={text('contract_procurementUnitsEditor_unitIncluded')}
                    checked={isSelected}
                    onChange={() => onToggleUnitInclusion(unitOption.id)}
                  />
                  {currentContracts.length !== 0 && !isCurrentContract && (
                    <CurrentContractDisplay>
                      <Text>contract_procurementUnitsEditor_currentContracts</Text>
                      <div>
                        {currentContracts.map((currentContract: Contract) => (
                          <TextButton
                            key={currentContract.id}
                            style={{ display: 'block' }}
                            onClick={() => editContract(currentContract.id!)}>
                            <DateRangeDisplay
                              startDate={currentContract.startDate}
                              endDate={currentContract.endDate}
                            />
                          </TextButton>
                        ))}
                      </div>
                    </CurrentContractDisplay>
                  )}
                </HeaderSection>
              </ProcurementUnitOptionContainer>
            )
          })}
        </UnitContentWrapper>
      </ContractProcurementUnitsEditorView>
    )
  }
)

export default ContractProcurementUnitsEditor
