import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { InspectionStatus, PostInspection } from '../schema-types'
import {
  useHasAdminAccessRights,
  useHasOperatorUserAccessRights,
  useIsTestUser,
} from '../util/userRoles'
import { ButtonStyle } from '../common/components/buttons/Button'
import { text, Text } from '../util/translate'
import { DEBUG } from '../constants'
import { InspectionAcceptButton } from './InspectionActions'

const PostInspectionAcceptanceView = styled.div`
  margin-left: auto;
  display: flex;
`

const AcceptedDisplay = styled.div`
  border-radius: 5px;
  border: 1px solid var(--green);
  background: var(--lightest-green);
  padding: 3px 7px;
  color: var(--green);
  margin-right: 1rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  font-weight: bold;

  &:last-child {
    margin-right: 0;
  }

  &:before {
    content: '✓';
    display: inline-block;
    margin-right: 5px;
    font-size: 1rem;
  }
`

export type PostInspectionAcceptancePropTypes = {
  inspection: PostInspection
  onAccept: () => unknown
  loading?: boolean
}

const PostInspectionAcceptance: React.FC<PostInspectionAcceptancePropTypes> = observer(
  ({ onAccept, inspection, loading }) => {
    var hasErrors = inspection?.inspectionErrors?.length !== 0
    let isDebugAndTestUser = DEBUG && useIsTestUser()
    let isHslAdmin = useHasAdminAccessRights()
    let isOperatorUser = useHasOperatorUserAccessRights(inspection.operatorId)

    let canAcceptAsHslAdmin = isDebugAndTestUser || isHslAdmin
    let canAcceptAsOperatorUser = isDebugAndTestUser || isOperatorUser

    return (
      <PostInspectionAcceptanceView>
        {inspection.hslAccepted ? (
          <AcceptedDisplay>
            <Text>postInspection_acceptance_hslAccepted</Text>
          </AcceptedDisplay>
        ) : canAcceptAsHslAdmin ? (
          <InspectionAcceptButton
            hasErrors={hasErrors}
            onClick={onAccept}
            label={text('postInspection_acceptance_hslAcceptButtonLabel')}
            loading={loading}
          />
        ) : null}
        {inspection.operatorAccepted ? (
          <AcceptedDisplay>
            <Text>postInspection_acceptance_operatorAccepted</Text>
          </AcceptedDisplay>
        ) : canAcceptAsOperatorUser ? (
          <InspectionAcceptButton
            hasErrors={hasErrors}
            onClick={onAccept}
            buttonStyle={ButtonStyle.ACCEPT}
            label={text('postInspection_acceptance_operatorAcceptButtonLabel')}
            loading={loading}
          />
        ) : null}
        {/* The inspection will be published automatically when both parties have accepted. In case of an error, the inspection
         is returned back to InReview state and a backup button is needed to retry the publish. */}
        {inspection.status === InspectionStatus.InReview &&
          inspection.hslAccepted &&
          inspection.operatorAccepted && (
            <InspectionAcceptButton
              hasErrors={hasErrors}
              onClick={onAccept}
              label={text('inspection_actions_publish')}
              loading={loading}
            />
          )}
      </PostInspectionAcceptanceView>
    )
  }
)

export default PostInspectionAcceptance
