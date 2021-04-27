import React, { useCallback, useContext, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import ExpandableSection, {
  HeaderMainHeading,
  HeaderSection,
} from '../common/components/ExpandableSection'
import { Button, ButtonSize, ButtonStyle } from '../common/components/buttons/Button'
import { InspectionContext } from '../inspection/InspectionContext'
import {
  InspectionValidationError,
  ObservedExecutionRequirement,
  ObservedRequirementValueInput,
} from '../schema-types'
import { useMutationData } from '../util/useMutationData'
import { useObservedRequirements } from './executionRequirementUtils'
import {
  createObservedExecutionRequirementsFromPreInspectionRequirementsMutation,
  observedExecutionRequirementsQuery,
  previewObservedRequirementQuery,
  removeExecutionRequirementsFromPostInspectionMutation,
  updateObservedExecutionRequirementValuesMutation,
} from './executionRequirementsQueries'
import { groupBy, toString } from 'lodash'
import { getReadableDateRange } from '../util/formatDate'
import { FlexRow } from '../common/components/common'
import { LoadingDisplay } from '../common/components/Loading'
import FormSaveToolbar from '../common/components/FormSaveToolbar'
import { useLazyQueryData } from '../util/useLazyQueryData'
import { useHasInspectionError } from '../util/hasInspectionError'
import { inspectionQuery } from '../inspection/inspectionQueries'
import ObservedRequirementsTable, {
  EditObservedRequirementValue,
} from './ObservedRequirementsTable'
import { Text } from '../util/translate'

const PostInspectionExecutionRequirementsView = styled.div`
  position: relative;
  min-height: 120px;
`

const RequirementAreasWrapper = styled.div`
  padding-bottom: 3rem;
`

const RequirementAreaRow = styled.div``

const RequirementWeeksWrapper = styled.div`
  width: 100%;
`

const ExecutionRequirementWeek = styled.div`
  margin-bottom: 2rem;
`

const WeekHeading = styled.h4`
  margin: 0;
  font-size: 1.2rem;
`

const AreaHeading = styled.h3`
  margin-bottom: 0.5rem;
  font-weight: normal;
`

export type PropTypes = {
  isEditable: boolean
}

const PostInspectionExecutionRequirements = observer(({ isEditable }: PropTypes) => {
  let { inspection } = useContext(InspectionContext)

  let execReqsMissing = useHasInspectionError(
    inspection,
    InspectionValidationError.MissingExecutionRequirements
  )

  let {
    data: observedRequirements,
    loading: observedRequirementsLoading,
    refetch,
  } = useObservedRequirements(inspection?.id)

  let [previewObservedRequirement, { loading: previewLoading }] = useLazyQueryData(
    previewObservedRequirementQuery
  )

  let [requirementPreviewLoadingId, setRequirementPreviewLoadingId] = useState('')

  let onPreviewRequirement = useCallback(
    (requirementId) => {
      if (isEditable) {
        setRequirementPreviewLoadingId(requirementId)

        previewObservedRequirement({
          variables: {
            requirementId,
          },
        })
      }
    },
    [previewObservedRequirement, isEditable]
  )

  let [createRequirements, { loading: createLoading }] = useMutationData(
    createObservedExecutionRequirementsFromPreInspectionRequirementsMutation,
    {
      refetchQueries: [
        {
          query: observedExecutionRequirementsQuery,
          variables: {
            postInspectionId: inspection?.id,
          },
        },
        { query: inspectionQuery, variables: { inspectionId: inspection?.id || '' } },
      ],
      notifyOnNetworkStatusChange: true,
      variables: {
        postInspectionId: inspection?.id,
      },
    }
  )

  let [updateRequirements, { loading: updateLoading }] = useMutationData(
    updateObservedExecutionRequirementValuesMutation,
    {
      refetchQueries: [
        {
          query: observedExecutionRequirementsQuery,
          variables: {
            postInspectionId: inspection?.id,
          },
        },
      ],
    }
  )

  let [removeRequirements, { loading: removeLoading }] = useMutationData(
    removeExecutionRequirementsFromPostInspectionMutation,
    {
      refetchQueries: [
        {
          query: observedExecutionRequirementsQuery,
          variables: {
            postInspectionId: inspection?.id,
          },
        },
        { query: inspectionQuery, variables: { inspectionId: inspection?.id || '' } },
      ],
    }
  )

  let onClickCreateRequirements = useCallback(async () => {
    if (inspection && isEditable) {
      await createRequirements({
        variables: {
          postInspectionId: inspection?.id,
        },
      })
    }
  }, [inspection, createRequirements, isEditable])

  let onClickRemoveRequirements = useCallback(async () => {
    if (inspection && observedRequirements.length && isEditable) {
      await removeRequirements({
        variables: {
          postInspectionId: inspection?.id,
        },
      })
    }
  }, [inspection, removeRequirements, observedRequirements, isEditable])

  let requirementsByAreaAndWeek: Array<
    [string, Array<[string, ObservedExecutionRequirement[]]>]
  > = useMemo(
    () =>
      Object.entries<ObservedExecutionRequirement[]>(
        groupBy<ObservedExecutionRequirement>(observedRequirements, (req) =>
          getReadableDateRange({ start: req.startDate, end: req.endDate })
        )
      ).map(([areaName, areaReqs]) => [
        areaName,
        Object.entries<ObservedExecutionRequirement[]>(
          groupBy<ObservedExecutionRequirement>(areaReqs, 'area.name')
        ),
      ]),
    [observedRequirements]
  )

  let [pendingValues, setPendingValues] = useState<EditObservedRequirementValue[]>([])

  let createValueEdit = useCallback(
    (requirement) => (key, value, item) => {
      if (!isEditable || key !== 'quotaRequired') {
        return
      }

      let editValue: EditObservedRequirementValue = {
        key,
        value,
        item,
        itemId: requirement.id,
      }

      setPendingValues((currentValues) => {
        let existingEditValueIndex = currentValues.findIndex(
          (val) => val.key === key && val.item.id === item.id && val.itemId === requirement.id
        )

        if (existingEditValueIndex !== -1) {
          currentValues.splice(existingEditValueIndex, 1)
        }

        return [...currentValues, editValue]
      })
    },
    [isEditable]
  )

  let onSaveEditedValues = useCallback(async () => {
    if (!isEditable) {
      return
    }

    let updateQueries: Promise<unknown>[] = []
    let requirementGroups = Object.entries<EditObservedRequirementValue[]>(
      groupBy<EditObservedRequirementValue>(pendingValues, 'itemId')
    )

    for (let [requirementId, reqPendingValues] of requirementGroups) {
      let updateValues = new Map<string, ObservedRequirementValueInput>()

      for (let value of reqPendingValues) {
        if (!value.item?.id) {
          continue
        }

        let updateItem = updateValues.get(value.item.id) || {
          id: value.item.id,
          emissionClass: value.item.emissionClass,
        }

        updateItem[value.key] = parseFloat(toString(value.value || '0'))
        updateValues.set(value.item.id, updateItem)
      }

      let updatePromise = updateRequirements({
        variables: {
          requirementId: requirementId,
          updateValues: Array.from(updateValues.values()),
        },
      })

      updateQueries.push(updatePromise)
    }

    setPendingValues([])
    await Promise.all(updateQueries)
  }, [pendingValues, updateRequirements, isEditable])

  let onCancelEdit = useCallback(() => {
    setPendingValues([])
  }, [])

  return (
    <ExpandableSection
      error={execReqsMissing}
      isExpanded={true}
      unmountOnClose={true}
      headerContent={
        <>
          <HeaderMainHeading>
            <Text>executionRequirements</Text>
          </HeaderMainHeading>
          <HeaderSection style={{ padding: '0.5rem 0.75rem', justifyContent: 'center' }}>
            {observedRequirements?.length !== 0 && (
              <Button
                loading={observedRequirementsLoading}
                style={{ marginLeft: 'auto' }}
                buttonStyle={ButtonStyle.SECONDARY}
                size={ButtonSize.SMALL}
                onClick={refetch}>
                <Text>update</Text>
              </Button>
            )}
          </HeaderSection>
        </>
      }>
      <PostInspectionExecutionRequirementsView>
        <LoadingDisplay
          loading={updateLoading || createLoading || observedRequirementsLoading}
        />
        {isEditable && (
          <FlexRow style={{ marginBottom: '1.5rem' }}>
            <Button onClick={onClickCreateRequirements} loading={createLoading}>
              Luo suoritevaatimukset ennakkotarkastuksesta
            </Button>
            {observedRequirements.length !== 0 && (
              <Button
                style={{ marginLeft: 'auto' }}
                onClick={onClickRemoveRequirements}
                loading={removeLoading}
                buttonStyle={ButtonStyle.SECONDARY_REMOVE}>
                Poista tarkastuksen suoritevaatimukset
              </Button>
            )}
          </FlexRow>
        )}
        {observedRequirements.length !== 0 ? (
          <RequirementAreasWrapper>
            {requirementsByAreaAndWeek.map(([weekLabel, areaReqs]) => (
              <ExpandableSection
                key={weekLabel}
                headerContent={
                  <HeaderSection>
                    <WeekHeading>{weekLabel}</WeekHeading>
                  </HeaderSection>
                }>
                <RequirementAreaRow key={weekLabel}>
                  <RequirementWeeksWrapper>
                    {areaReqs.map(([areaLabel, weekRequirementAreas]) => (
                      <ExecutionRequirementWeek key={areaLabel + weekLabel}>
                        <FlexRow>
                          <AreaHeading>{areaLabel}</AreaHeading>
                        </FlexRow>
                        {weekRequirementAreas.map((requirement) => (
                          <React.Fragment key={requirement.id}>
                            <ObservedRequirementsTable
                              executionRequirement={requirement}
                              isEditable={isEditable}
                              onEditValue={
                                isEditable ? createValueEdit(requirement) : undefined
                              }
                              pendingValues={
                                isEditable
                                  ? pendingValues.filter(
                                      (val) => val.itemId === requirement.id
                                    )
                                  : []
                              }
                              onSaveEdit={isEditable ? onSaveEditedValues : undefined}
                              onCancelEdit={isEditable ? onCancelEdit : undefined}
                            />
                            {isEditable && (
                              <FlexRow>
                                <Button
                                  onClick={() => onPreviewRequirement(requirement.id)}
                                  loading={
                                    requirementPreviewLoadingId === requirement.id &&
                                    previewLoading
                                  }>
                                  {isEditable ? 'Esikatsele' : 'Hae'} viikon toteuma
                                </Button>
                              </FlexRow>
                            )}
                          </React.Fragment>
                        ))}
                      </ExecutionRequirementWeek>
                    ))}
                  </RequirementWeeksWrapper>
                </RequirementAreaRow>
              </ExpandableSection>
            ))}
          </RequirementAreasWrapper>
        ) : null}
        {pendingValues.length !== 0 && (
          <FormSaveToolbar
            floating={true}
            onSave={onSaveEditedValues}
            onCancel={onCancelEdit}
          />
        )}
      </PostInspectionExecutionRequirementsView>
    </ExpandableSection>
  )
})

export default PostInspectionExecutionRequirements
