import React, { CSSProperties, useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Inspection, InspectionStatus, InspectionType, Season } from '../schema-types'
import { Button, ButtonSize, ButtonStyle } from '../common/components/Button'
import {
  useEditInspection,
  useInspectionReports,
  useRemoveInspection,
} from './inspectionUtils'
import { useMutationData } from '../util/useMutationData'
import {
  publishInspectionMutation,
  readyInspectionMutation,
  rejectInspectionMutation,
  submitInspectionMutation,
} from './inspectionQueries'
import { useStateValue } from '../state/useAppState'
import { useMatch } from '@reach/router'
import { useHasAdminAccessRights, useHasOperatorUserAccessRights } from '../util/userRoles'
import InspectionApprovalSubmit from './InspectionApprovalSubmit'
import { navigateWithQueryString } from '../util/urlValue'
import { Text } from '../util/translate'

const ButtonRow = styled.div`
  margin: auto -1rem 0;
  padding: 0.75rem 1rem 0.75rem;
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

type Actions = 'publish' | 'reject' | 'submit' | 'remove' | 'ready'

export type PropTypes = {
  inspection: Inspection
  onRefresh: () => unknown
  className?: string
  style?: CSSProperties
  disabledActions?: Actions[]
}

const InspectionActions = observer(
  ({ inspection, onRefresh, className, style, disabledActions = [] }: PropTypes) => {
    var [season, setSeason] = useStateValue<Season>('globalSeason')
    var [isSubmitActive, setSubmitActive] = useState<boolean>(false)
    let hasAdminAccessRights = useHasAdminAccessRights()
    let hasOperatorUserAccessRights = useHasOperatorUserAccessRights(
      inspection?.operatorId || undefined
    )

    var isEditing: boolean = Boolean(useMatch(`/:inspectionType/edit/:inspectionId/*`))

    var goToInspectionEdit = useEditInspection(inspection.inspectionType)
    var goToInspectionReports = useInspectionReports()

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

    var [setInspectionReady, { loading: readyLoading }] = useMutationData(
      readyInspectionMutation
    )

    var [publishInspection, { loading: publishLoading }] = useMutationData(
      publishInspectionMutation
    )

    var [rejectInspection, { loading: rejectLoading }] = useMutationData(
      rejectInspectionMutation
    )

    var onSubmitProcessStart = useCallback(() => {
      setSubmitActive(true)
    }, [])

    var onCancelSubmit = useCallback(() => {
      setSubmitActive(false)
    }, [])

    var onSubmitInspection = useCallback(
      async (startDate: string, endDate: string) => {
        if (disabledActions.includes('submit')) {
          return
        }

        await submitInspection({
          variables: {
            inspectionId: inspection.id,
            startDate,
            endDate,
          },
        })

        await onRefresh()
        setSubmitActive(false)
      },
      [onRefresh, inspection, disabledActions]
    )

    var onReadyInspection = useCallback(async () => {
      if (disabledActions.includes('ready')) {
        return
      }

      await setInspectionReady({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, disabledActions])

    var onPublishInspection = useCallback(async () => {
      if (disabledActions.includes('publish')) {
        return
      }

      await publishInspection({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, disabledActions])

    var onRejectInspection = useCallback(async () => {
      if (disabledActions.includes('reject')) {
        return
      }

      await rejectInspection({
        variables: {
          inspectionId: inspection.id,
        },
      })

      await onRefresh()
    }, [onRefresh, inspection, disabledActions])

    let canUserPublish =
      inspection.status === InspectionStatus.InReview && hasAdminAccessRights

    // Pre-inspection which are drafts and post-inspections which are ready can be submitted for approval.
    let canInspectionBeSubmitted =
      (inspection.inspectionType === InspectionType.Pre &&
        inspection.status === InspectionStatus.Draft) ||
      (inspection.inspectionType === InspectionType.Post &&
        inspection.status === InspectionStatus.Ready)

    // Only post-inspections which are in draft state can be readied.
    let canInspectionBeReady =
      inspection.inspectionType === InspectionType.Post &&
      inspection.status === InspectionStatus.Draft

    let isInspectionSubmitDisabled = disabledActions.includes('submit')
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
          {!isSubmitActive && canInspectionBeSubmitted && isEditing && (
            <Button
              loading={submitLoading}
              buttonStyle={ButtonStyle.NORMAL}
              disabled={isInspectionSubmitDisabled}
              size={ButtonSize.MEDIUM}
              onClick={onSubmitProcessStart}>
              <Text>inspection_actions_openSubmitContainer</Text>
            </Button>
          )}

          {canInspectionBeReady && hasOperatorUserAccessRights && isEditing && (
            <Button
              loading={readyLoading}
              buttonStyle={ButtonStyle.ACCEPT}
              size={ButtonSize.MEDIUM}
              onClick={onReadyInspection}>
              <Text>inspection_actions_canBeAccepted</Text>
            </Button>
          )}

          {[InspectionStatus.Draft, InspectionStatus.InProduction].includes(
            inspection.status
          ) &&
            hasAdminAccessRights && (
              <Button
                disabled={disabledActions.includes('remove')}
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
                disabled={disabledActions.includes('publish')}
                style={{ marginLeft: 'auto' }}
                loading={publishLoading}
                buttonStyle={ButtonStyle.NORMAL}
                size={ButtonSize.MEDIUM}
                onClick={onPublishInspection}>
                <Text>inspection_actions_publish</Text>
              </Button>
              <Button
                disabled={disabledActions.includes('reject')}
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
        {isSubmitActive &&
          canInspectionBeSubmitted &&
          hasOperatorUserAccessRights &&
          isEditing && (
            <InspectionApprovalSubmit
              disabled={isInspectionSubmitDisabled}
              inspection={inspection}
              onSubmit={onSubmitInspection}
              onCancel={onCancelSubmit}
              loading={submitLoading}
            />
          )}
      </>
    )
  }
)

export default InspectionActions
