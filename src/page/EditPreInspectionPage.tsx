import React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from '@reach/router'
import PreInspectionEditor from '../preInspection/PreInspectionEditor'
import { Page } from '../common/components/common'
import { observer } from 'mobx-react-lite'
import Tabs from '../common/components/Tabs'
import PreInspectionPreview from '../preInspection/PreInspectionPreview'
import { PreInspectionContext } from '../preInspection/PreInspectionContext'
import { Button, ButtonSize, ButtonStyle } from '../common/components/Button'
import { useStateValue } from '../state/useAppState'
import { useEditInspection, useInspectionById } from '../preInspection/inspectionUtils'
import { MessageContainer, MessageView } from '../common/components/Messages'
import { PageTitle } from '../common/components/Typography'
import { useRefetch } from '../util/useRefetch'
import { InspectionType } from '../schema-types'

const EditPreInspectionView = styled(Page)``

export type PropTypes = {
  inspectionId?: string
} & RouteComponentProps

const EditPreInspectionPage: React.FC<PropTypes> = observer(({ inspectionId = '' }) => {
  var [season] = useStateValue('globalSeason')
  var [operator] = useStateValue('globalOperator')
  var editPreInspection = useEditInspection(InspectionType.Pre)

  let {
    data: inspection,
    loading: inspectionLoading,
    refetch: refetchInspection,
  } = useInspectionById(inspectionId)

  let refetch = useRefetch(refetchInspection)

  return (
    <EditPreInspectionView>
      <PreInspectionContext.Provider value={inspection || null}>
        <PageTitle>
          Uusi ennakkotarkastus
          <Button
            style={{ marginLeft: 'auto' }}
            size={ButtonSize.MEDIUM}
            buttonStyle={ButtonStyle.SECONDARY_REMOVE}
            onClick={() => editPreInspection()}>
            Peruuta
          </Button>
        </PageTitle>
        {!operator || !season ? (
          <MessageContainer>
            <MessageView>Valitse liikennöitsijä ja kausi.</MessageView>
          </MessageContainer>
        ) : !inspection ? (
          <MessageContainer>
            <MessageView>Haettu ennakkotarkastus ei löytynyt.</MessageView>
            <Button onClick={() => editPreInspection()}>Takaisin</Button>
          </MessageContainer>
        ) : (
          <Tabs>
            <PreInspectionEditor
              name="create"
              path="/"
              label="Muokkaa"
              loading={inspectionLoading}
              refetchData={refetch}
            />
            <PreInspectionPreview
              path="preview"
              name="preview"
              label="Esikatsele"
              refetchData={refetch}
            />
          </Tabs>
        )}
      </PreInspectionContext.Provider>
    </EditPreInspectionView>
  )
})

export default EditPreInspectionPage
