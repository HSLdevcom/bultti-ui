import React, { CSSProperties, useCallback, useContext, useEffect } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Inspection, InspectionStatus, InspectionType, Season } from '../schema-types'
import { Button, ButtonSize, ButtonStyle } from '../common/components/buttons/Button'
import {
  useEditInspection,
  useNavigateToInspectionReports,
  useRemoveInspection,
} from './inspectionUtils'
import { useMutationData } from '../util/useMutationData'
import {
  makeInspectionSanctionableMutation,
  publishInspectionMutation,
  rejectInspectionMutation,
  submitInspectionMutation,
} from './inspectionQueries'
import { useStateValue } from '../state/useAppState'
import { useMatch } from '@reach/router'
import { useHasAdminAccessRights, useHasOperatorUserAccessRights } from '../util/userRoles'
import { navigateWithQueryString } from '../util/urlValue'
import { Text } from '../util/translate'
import { InspectionContext } from './InspectionContext'

const ButtonRow = styled.div`
  margin: auto -1rem 0;
  padding: 0.5rem 1rem 0.5rem;
  border-top: 1px solid var(--lighter-grey);
  display: flex;
  align-items: center;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  > * {
    margin-right: 1rem;
  }

  &:empty {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }
`

export type PropTypes = {
  inspection: Inspection
  onRefresh: () => unknown
  className?: string
  style?: CSSProperties
}

const InspectionActions = observer(
  ({ inspection, onRefresh, className, style }: PropTypes) => {
    var [season, setSeason] = useStateValue<Season>('globalSeason')
    let hasAdminAccessRights = useHasAdminAccessRights()
    let hasOperatorUserAccessRights = useHasOperatorUserAccessRights(
      inspection?.operatorId || undefined
    )

    var isEditing: boolean = Boolean(useMatch(`/:inspectionType/edit/:inspectionId/*`))

    var goToInspectionEdit = useEditInspection(inspection.inspectionType)
    var goToInspectionReports = useNavigateToInspectionReports()

    var hasErrors = inspection?.inspectionErrors?.length !== 0

    var onEditInspection = useCallback(
      (inspection: Inspection) => {
        // If the season of the inspection is not already selected, ensure it is selected.
        if (inspection.seasonId !== season.id) {
          setSeason(inspection.season)
        }

        goToInspectionEdit(inspection)
      },
      [goToInspectionEdit, setSeason, season]
    )

    var [removeInspection, { loading: removeLoading }] = useRemoveInspection(
      inspection,
      onRefresh
    )

    let onRemoveInspection = useCallback(async () => {
      let removed = await removeInspection(inspection)

      if (removed) {
        let pathSegment = inspection.inspectionType === InspectionType.Pre ? 'pre' : 'post'
        navigateWithQueryString(`/${pathSegment}-inspection/edit`)
      }
    }, [removeInspection, inspection])

    var [submitInspection, { loading: submitLoading }] = useMutationData(
      submitInspectionMutation
    )

    var [setInspectionSanctionable, { loading: sanctionableLoading }] = useMutationData(
      makeInspectionSanctionableMutation
    )

    var [publishInspection, { loading: publishLoading }] = useMutationData(
      publishInspectionMutation
    )

    var [rejectInspection, { loading: rejectLoading }] = useMutationData(
      rejectInspectionMutation
    )

    var onSubmitInspection = useCallback(async () => {
      await submitInspection({
        variables: {
          inspectionId: inspection.id,
          startDate: inspection.startDate,
          endDate: inspection.endDate,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, hasErrors])

    var onMakeInspectionSanctionable = useCallback(async () => {
      if (hasErrors) {
        return
      }

      await setInspectionSanctionable({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, hasErrors])

    var onPublishInspection = useCallback(async () => {
      if (hasErrors) {
        return
      }

      await publishInspection({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, hasErrors])

    var onRejectInspection = useCallback(async () => {
      await rejectInspection({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection])

    let canUserPublish =
      inspection.status === InspectionStatus.InReview && hasAdminAccessRights

    // Pre-inspection which are drafts and post-inspections which are ready can be submitted for approval.
    let canInspectionBeSubmitted =
      (inspection.inspectionType === InspectionType.Pre &&
        inspection.status === InspectionStatus.Draft) ||
      (inspection.inspectionType === InspectionType.Post &&
        inspection.status === InspectionStatus.Sanctionable)

    // Only post-inspections which are in draft state can be made sanctionable.
    let canInspectionBeSanctionable =
      inspection.inspectionType === InspectionType.Post &&
      inspection.status === InspectionStatus.Draft

    let { isDirty } = useContext(InspectionContext)
    console.log('isDirty ? ', isDirty)
    return (
      <>
        <ButtonRow className={className} style={style}>
          {!isEditing && (
            <Button
              buttonStyle={ButtonStyle.NORMAL}
              size={ButtonSize.MEDIUM}
              onClick={() => onEditInspection(inspection)}>
              {inspection.status === InspectionStatus.Draft ? 'Muokkaa' : 'Avaa'}
            </Button>
          )}
          {inspection.status !== InspectionStatus.Draft && (
            <Button
              style={
                inspection.status === InspectionStatus.InProduction
                  ? { marginLeft: 'auto', marginRight: 0 }
                  : undefined
              }
              onClick={() => goToInspectionReports(inspection.id, inspection.inspectionType)}
              buttonStyle={
                inspection.status === InspectionStatus.InProduction
                  ? ButtonStyle.NORMAL
                  : ButtonStyle.SECONDARY
              }
              size={ButtonSize.MEDIUM}>
              Raportit
            </Button>
          )}
          {canInspectionBeSubmitted && isEditing && (
            <Button
              loading={submitLoading}
              buttonStyle={ButtonStyle.NORMAL}
              disabled={hasErrors || !isDirty}
              size={ButtonSize.MEDIUM}
              onClick={onSubmitInspection}>
              <Text>inspection_actions_submit</Text>
            </Button>
          )}

          {canInspectionBeSanctionable && hasOperatorUserAccessRights && isEditing && (
            <Button
              loading={sanctionableLoading}
              buttonStyle={ButtonStyle.ACCEPT}
              size={ButtonSize.MEDIUM}
              disabled={hasErrors}
              onClick={onMakeInspectionSanctionable}>
              <Text>inspection_actions_startSanctioning</Text>
            </Button>
          )}

          {[InspectionStatus.Draft, InspectionStatus.InProduction].includes(
            inspection.status
          ) &&
            hasAdminAccessRights && (
              <Button
                style={{ marginLeft: 'auto', marginRight: 0 }}
                loading={removeLoading}
                buttonStyle={ButtonStyle.SECONDARY_REMOVE}
                size={ButtonSize.MEDIUM}
                onClick={onRemoveInspection}>
                <Text>inspection_actions_remove</Text>
              </Button>
            )}

          {inspection.status === InspectionStatus.InReview && canUserPublish && isEditing && (
            <>
              <Button
                disabled={hasErrors}
                style={{ marginLeft: 'auto' }}
                loading={publishLoading}
                buttonStyle={ButtonStyle.NORMAL}
                size={ButtonSize.MEDIUM}
                onClick={onPublishInspection}>
                <Text>inspection_actions_publish</Text>
              </Button>
              <Button
                style={{ marginLeft: 'auto', marginRight: 0 }}
                loading={rejectLoading}
                buttonStyle={ButtonStyle.REMOVE}
                size={ButtonSize.MEDIUM}
                onClick={onRejectInspection}>
                <Text>inspection_actions_reject</Text>
              </Button>
            </>
          )}
        </ButtonRow>
      </>
    )
  }
)

export default InspectionActions
