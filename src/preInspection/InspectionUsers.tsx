import React, { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, ButtonSize, ButtonStyle } from '../common/components/Button'
import { useStateValue } from '../state/useAppState'
import ExpandableSection, {
  HeaderMainHeading,
  HeaderSection,
} from '../common/components/ExpandableSection'
import { PreInspectionContext } from './PreInspectionContext'
import { useMutationData } from '../util/useMutationData'
import {
  inspectionUserRelationsQuery,
  toggleUserInspectionSubscription,
} from './preInspectionQueries'
import { useQueryData } from '../util/useQueryData'
import { LoadingDisplay } from '../common/components/Loading'
import { useRefetch } from '../util/useRefetch'
import UserRelations from '../common/components/UserRelations'

export type PropTypes = {}

const InspectionUsers: React.FC<PropTypes> = observer(() => {
  var [user] = useStateValue('user')
  var inspection = useContext(PreInspectionContext)

  let { data: inspectionRelations, loading: relationsLoading, refetch } = useQueryData(
    inspectionUserRelationsQuery,
    {
      skip: !inspection,
      variables: {
        inspectionId: inspection?.id,
      },
    }
  )

  let refetchRelations = useRefetch(refetch)

  let [toggleSubscribed, { loading: userSubscribedLoading }] = useMutationData(
    toggleUserInspectionSubscription
  )

  let onToggleSubscribed = useCallback(async () => {
    if (inspection && user) {
      await toggleSubscribed({
        variables: {
          inspectionId: inspection.id,
          userId: user.id,
        },
      })

      refetchRelations()
    }
  }, [inspection, user, toggleSubscribed, refetchRelations])

  return (
    <ExpandableSection
      headerContent={
        <>
          <HeaderMainHeading>Käyttäjät</HeaderMainHeading>
          <HeaderSection style={{ padding: '0.5rem 0.75rem', justifyContent: 'center' }}>
            <Button
              style={{ marginLeft: 'auto' }}
              buttonStyle={ButtonStyle.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={() => {}}>
              Päivitä
            </Button>
          </HeaderSection>
        </>
      }>
      <LoadingDisplay loading={relationsLoading} />
      {inspection && (
        <UserRelations
          relations={inspectionRelations}
          loading={userSubscribedLoading}
          onToggleSubscribed={onToggleSubscribed}
        />
      )}
    </ExpandableSection>
  )
})

export default InspectionUsers
