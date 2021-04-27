import React, { useCallback, useContext, useMemo } from 'react'
import styled, { css } from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { LoadingDisplay } from '../common/components/Loading'
import RequirementsTable from './RequirementsTable'
import {
  createExecutionRequirementForProcurementUnitMutation,
  executionRequirementForProcurementUnitQuery,
  refreshExecutionRequirementForProcurementUnitMutation,
  removeExecutionRequirementMutation,
  weeklyMetersFromJoreMutation,
} from './executionRequirementsQueries'
import { FlexRow } from '../common/components/common'
import { Button, ButtonSize, ButtonStyle } from '../common/components/buttons/Button'
import { useMutationData } from '../util/useMutationData'
import { InspectionContext } from '../inspection/InspectionContext'
import RequirementEquipmentList, { equipmentColumnLabels } from './RequirementEquipmentList'
import {
  createRequirementEquipment,
  EquipmentWithQuota,
  useEquipmentCrud,
} from '../equipment/equipmentUtils'
import { parseISO } from 'date-fns'
import AddEquipment from '../equipment/AddEquipment'
import { ExecutionRequirement, ProcurementUnit } from '../schema-types'
import { MessageView } from '../common/components/Messages'
import { SectionHeading, SubHeading } from '../common/components/Typography'
import { RequirementsTableLayout } from './executionRequirementUtils'
import { text, Text } from '../util/translate'
import { useQueryData } from '../util/useQueryData'
import PlannedExecutionStats from './PlannedExecutionStats'

const ProcurementUnitExecutionRequirementView = styled.div<{ isInvalid: boolean }>`
  margin-bottom: 2rem;
  position: relative;
  transition: 0.3s ease-out;
  border-radius: 0.5rem;

  ${(p) =>
    p.isInvalid
      ? css`
          border: 1px solid #ffacac;
          padding: 1rem;
          margin: -0.5rem -0.5rem 1rem;
          background: rgba(255, 252, 252, 1);
        `
      : ''}
`

const ExecutionDisplay = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--white-grey);
  border: 1px solid var(--lightest-grey);
  border-radius: 1rem;

  > div {
    display: flex;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  button {
    margin-left: 1rem;
  }
`

export type PropTypes = {
  procurementUnit: ProcurementUnit
  isEditable: boolean
  onUpdate?: () => unknown
  valid: boolean
}

const ProcurementUnitExecutionRequirement: React.FC<PropTypes> = observer(
  ({ procurementUnit, isEditable, onUpdate, valid = true }) => {
    let { inspection } = useContext(InspectionContext)

    let {
      data: procurementUnitRequirement,
      loading: requirementsLoading,
      refetch: updateRequirements,
    } = useQueryData<ExecutionRequirement>(executionRequirementForProcurementUnitQuery, {
      variables: {
        procurementUnitId: procurementUnit.id,
        inspectionId: inspection?.id,
      },
    })

    let [createExecutionRequirement, { loading: createLoading }] = useMutationData(
      createExecutionRequirementForProcurementUnitMutation
    )

    let [refreshExecutionRequirement, { loading: refreshLoading }] = useMutationData(
      refreshExecutionRequirementForProcurementUnitMutation
    )

    let [execRemoveExecutionRequirement] = useMutationData(removeExecutionRequirementMutation)

    let [updateWeeklyMeters, { loading: weeklyMetersUpdateLoading }] = useMutationData(
      weeklyMetersFromJoreMutation,
      {
        variables: {
          executionRequirementId: procurementUnitRequirement?.id,
          date: inspection?.inspectionStartDate,
        },
      }
    )

    let update = useCallback(() => {
      updateRequirements()

      if (onUpdate) {
        onUpdate()
      }
    }, [updateRequirements, onUpdate])

    let { addEquipment } = useEquipmentCrud(procurementUnitRequirement || undefined, update)

    let onCreateRequirements = useCallback(async () => {
      if (inspection) {
        await createExecutionRequirement({
          variables: {
            procurementUnitId: procurementUnit.id,
            inspectionId: inspection?.id,
          },
        })

        update()
      }
    }, [createExecutionRequirement, inspection])

    let onRefreshRequirements = useCallback(async () => {
      if (
        isEditable &&
        procurementUnitRequirement &&
        confirm(text('executionRequirement_refreshWarning'))
      ) {
        await refreshExecutionRequirement({
          variables: {
            executionRequirementId: procurementUnitRequirement.id,
          },
        })

        update()
      }
    }, [procurementUnitRequirement, refreshExecutionRequirement, isEditable])

    let removeExecutionRequirement = useCallback(async () => {
      if (
        isEditable &&
        procurementUnitRequirement &&
        confirm(text('executionRequirement_removeWarning'))
      ) {
        await execRemoveExecutionRequirement({
          variables: {
            requirementId: procurementUnitRequirement.id,
          },
        })

        update()
      }
    }, [procurementUnitRequirement, execRemoveExecutionRequirement, update, isEditable])

    const onUpdateWeeklyMeters = useCallback(async () => {
      if (isEditable) {
        await updateWeeklyMeters()
      }
    }, [isEditable, updateWeeklyMeters])

    const equipment: EquipmentWithQuota[] = useMemo(
      () =>
        procurementUnitRequirement
          ? createRequirementEquipment(procurementUnitRequirement)
          : [],
      [procurementUnitRequirement]
    )

    const inspectionStartDate = useMemo(
      () => (inspection ? parseISO(inspection.startDate) : new Date()),
      [inspection]
    )

    return (
      <ProcurementUnitExecutionRequirementView isInvalid={!valid}>
        <FlexRow style={{ marginBottom: '1rem', justifyContent: 'flex-start' }}>
          <SectionHeading style={{ marginBottom: 0 }}>
            <Text>executionRequirement_unitExecutionRequirements</Text>
          </SectionHeading>
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            <Button
              buttonStyle={ButtonStyle.NORMAL}
              size={ButtonSize.SMALL}
              onClick={update}
              loading={requirementsLoading}>
              <Text>update</Text>
            </Button>
            {isEditable && (
              <Button
                loading={refreshLoading}
                onClick={onRefreshRequirements}
                style={{ marginLeft: '0.5rem' }}
                buttonStyle={ButtonStyle.SECONDARY}
                size={ButtonSize.SMALL}>
                <Text>executionRequirement_refreshEquipment</Text>
              </Button>
            )}
          </div>
        </FlexRow>
        {procurementUnitRequirement && (
          <RequirementsTable
            executionRequirement={procurementUnitRequirement}
            tableLayout={RequirementsTableLayout.BY_EMISSION_CLASS}
          />
        )}
        <ExecutionDisplay>
          <div>
            <strong>
              <Text>executionRequirement_weeklyKilometers</Text>
            </strong>
            {isEditable && (
              <Button
                loading={weeklyMetersUpdateLoading}
                size={ButtonSize.SMALL}
                buttonStyle={ButtonStyle.SECONDARY}
                onClick={onUpdateWeeklyMeters}>
                <Text>executionRequirement_updateJoreKilometers</Text>
              </Button>
            )}
          </div>
          <span>{(procurementUnitRequirement?.weeklyMeters || 0) / 1000} km</span>
        </ExecutionDisplay>
        {procurementUnitRequirement && (
          <PlannedExecutionStats executionRequirement={procurementUnitRequirement} />
        )}
        <LoadingDisplay loading={requirementsLoading} />
        {procurementUnitRequirement ? (
          <>
            <SubHeading>
              <Text>executionRequirement_equipmentList</Text>
            </SubHeading>
            <RequirementEquipmentList
              isEditable={isEditable}
              startDate={inspectionStartDate}
              onEquipmentChanged={update}
              equipment={equipment}
              executionRequirement={procurementUnitRequirement}
            />
            {isEditable && (
              <AddEquipment
                operatorId={procurementUnitRequirement.operator.id}
                equipment={equipment}
                onEquipmentChanged={update}
                hasEquipment={equipment.length !== 0}
                addEquipment={addEquipment}
                removeAllEquipment={removeExecutionRequirement}
                removeLabel={text('executionRequirement_remove')}
                editableKeys={['percentageQuota']}
                fieldLabels={equipmentColumnLabels}
              />
            )}
          </>
        ) : (
          <>
            <MessageView>
              <Text>executionRequirement_missing</Text>
            </MessageView>
            <Button loading={createLoading} onClick={onCreateRequirements}>
              <Text>executionRequirement_create</Text>
            </Button>
          </>
        )}
      </ProcurementUnitExecutionRequirementView>
    )
  }
)

export default ProcurementUnitExecutionRequirement
