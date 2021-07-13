import React, { CSSProperties, useCallback } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Inspection, InspectionStatus, InspectionType, PostInspection } from '../schema-types'
import { Button, ButtonSize, ButtonStyle } from '../common/components/buttons/Button'
import {
  useCanEditInspection,
  useNavigateToInspection,
  useNavigateToInspectionReports,
  useRemoveInspection,
} from './inspectionUtils'
import { useMutationData } from '../util/useMutationData'
import {
  makePostInspectionSanctionableMutation,
  publishInspectionMutation,
  rejectInspectionMutation,
  submitInspectionMutation,
} from './inspectionQueries'
import { useStateValue } from '../state/useAppState'
import { useRouteMatch } from 'react-router-dom'
import { useHasAdminAccessRights } from '../util/userRoles'
import { text, Text } from '../util/translate'
import { useShowInfoNotification } from '../util/useShowNotification'
import { useNavigate } from '../util/urlValue'
import { useUnsavedChangesPrompt } from '../util/promptUnsavedChanges'
import PostInspectionAcceptance from './PostInspectionAcceptance'

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

type InspectionAcceptanceButtonPropTypes = {
  hasErrors: boolean
  onClick: () => unknown
  label: string
  loading?: boolean
  buttonStyle?: ButtonStyle
}

export const InspectionAcceptButton: React.FC<InspectionAcceptanceButtonPropTypes> = observer(
  ({ onClick, hasErrors, loading, label, buttonStyle = ButtonStyle.NORMAL }) => {
    return (
      <Button
        disabled={hasErrors}
        style={{ marginLeft: 'auto' }}
        loading={loading}
        buttonStyle={ButtonStyle.NORMAL}
        size={ButtonSize.MEDIUM}
        onClick={onClick}>
        {label}
      </Button>
    )
  }
)

export type PropTypes = {
  inspection: Inspection
  onRefresh: () => unknown
  className?: string
  style?: CSSProperties
  isEditingAllowed?: boolean
}

// TODO: Make a InspectionActions folder, separate action buttons into their own files to improve readability
const InspectionActions = observer(
  ({ inspection, onRefresh, className, style, isEditingAllowed = true }: PropTypes) => {
    var [globalSeason, setGlobalSeason] = useStateValue('globalSeason')
    var [globalOperator] = useStateValue('globalOperator')
    let hasAdminAccessRights = useHasAdminAccessRights()

    let canEditInspection = useCanEditInspection({
      inspectionType: inspection.inspectionType,
      operatorId: globalOperator.id,
    })

    var { inspectionType } = inspection
    // useRouteMatch returns null if the route does not match
    var isEditing = Boolean(useRouteMatch(`/:inspectionType/edit/:inspectionId`))

    var navigateToInspection = useNavigateToInspection(inspectionType)
    var goToInspectionReports = useNavigateToInspectionReports()

    var hasErrors = inspection?.inspectionErrors?.length !== 0
    var showInfoNotification = useShowInfoNotification()

    var onOpenInspection = useCallback(
      (inspection: Inspection) => {
        // If the season of the inspection is not already selected, change the selected season to match.
        if (inspection && inspection.seasonId !== globalSeason.id) {
          showInfoNotification(
            text('inspection_seasonChangedAutomatically', { newSeason: inspection.season.id })
          )

          setGlobalSeason(inspection.season)
        }

        navigateToInspection(inspection)
      },
      [inspection, navigateToInspection, setGlobalSeason, globalSeason]
    )

    var [removeInspection, { loading: removeLoading }] = useRemoveInspection(inspection)

    let navigate = useNavigate()

    let onRemoveInspection = useCallback(async () => {
      let removed = await removeInspection()

      if (removed) {
        let pathSegment = inspectionType === InspectionType.Pre ? 'pre' : 'post'
        navigate.push(`/${pathSegment}-inspection/edit`)
      }
    }, [removeInspection, navigate])

    var [submitInspection, { loading: submitLoading }] = useMutationData(
      submitInspectionMutation
    )

    var [setInspectionSanctionable, { loading: sanctionableLoading }] = useMutationData(
      makePostInspectionSanctionableMutation
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
      (inspectionType === InspectionType.Pre &&
        inspection.status === InspectionStatus.Draft) ||
      (inspectionType === InspectionType.Post &&
        inspection.status === InspectionStatus.Sanctionable)

    let canUserSubmit = useCanEditInspection({
      inspectionType: inspection.inspectionType,
      operatorId: inspection.operatorId,
    })

    // Only post-inspections which are in draft state can be made sanctionable.
    let canInspectionBeSanctionable =
      inspectionType === InspectionType.Post && inspection.status === InspectionStatus.Draft

    let canUserMakeSanctionable = useHasAdminAccessRights()

    let [isDirty] = useUnsavedChangesPrompt()

    return (
      <>
        <ButtonRow className={className} style={style}>
          {!isEditing && (
            <Button
              buttonStyle={ButtonStyle.NORMAL}
              size={ButtonSize.MEDIUM}
              disabled={!isEditingAllowed}
              onClick={() => onOpenInspection(inspection)}>
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
              onClick={() => goToInspectionReports(inspection.id, inspectionType)}
              buttonStyle={
                inspection.status === InspectionStatus.InProduction
                  ? ButtonStyle.NORMAL
                  : ButtonStyle.SECONDARY
              }
              size={ButtonSize.MEDIUM}>
              <Text>reports</Text>
            </Button>
          )}
          {canUserSubmit && canInspectionBeSubmitted && isEditing && (
            <Button
              loading={submitLoading}
              buttonStyle={ButtonStyle.NORMAL}
              disabled={hasErrors || isDirty}
              size={ButtonSize.MEDIUM}
              onClick={onSubmitInspection}>
              <Text>inspection_actions_submit</Text>
            </Button>
          )}

          {canUserMakeSanctionable && canInspectionBeSanctionable && isEditing && (
            <Button
              loading={sanctionableLoading}
              buttonStyle={ButtonStyle.ACCEPT}
              size={ButtonSize.MEDIUM}
              disabled={hasErrors || isDirty}
              onClick={onMakeInspectionSanctionable}>
              <Text>inspection_actions_startSanctioning</Text>
            </Button>
          )}

          {[InspectionStatus.Draft, InspectionStatus.InProduction].includes(
            inspection.status
          ) &&
            canEditInspection && (
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
              {inspectionType === InspectionType.Post ? (
                <PostInspectionAcceptance
                  loading={publishLoading}
                  inspection={inspection as PostInspection}
                  onAccept={onPublishInspection}
                />
              ) : (
                <InspectionAcceptButton
                  hasErrors={hasErrors}
                  onClick={onPublishInspection}
                  loading={publishLoading}
                  label={text('inspection_actions_publish')}
                />
              )}
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
