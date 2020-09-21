import React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from '@reach/router'
import PreInspectionEditor from '../preInspection/PreInspectionEditor'
import { Page } from '../common/components/common'
import { observer } from 'mobx-react-lite'
import Tabs from '../common/components/Tabs'
import PreInspectionPreview from '../preInspection/PreInspectionPreview'
import { PreInspectionContext } from '../preInspection/PreInspectionContext'
import { Button } from '../common/components/Button'
import { useStateValue } from '../state/useAppState'
import {
  getInspectionStatusColor,
  useEditInspection,
  useInspectionById,
} from '../inspection/inspectionUtils'
import { ErrorView, MessageContainer, MessageView } from '../common/components/Messages'
import { useRefetch } from '../util/useRefetch'
import { InspectionStatus, InspectionType } from '../schema-types'
import InspectionActions from '../preInspection/InspectionActions'
import { text, translate } from '../util/translate'
import { PageTitle } from '../common/components/PageTitle'

const EditPreInspectionView = styled(Page)``

const InspectionActionsRow = styled(InspectionActions)`
  border-top: 0;
  margin: 0 0 0.5rem;
  padding: 0.5rem 0.7rem 1rem;
`

const StatusBox = styled.div`
  margin: -0.75rem 0.7rem 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
`

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

  let hasErrors = inspection?.inspectionErrors?.length !== 0

  return (
    <EditPreInspectionView>
      <PreInspectionContext.Provider value={inspection || null}>
        <PageTitle loading={inspectionLoading} onRefresh={refetch}>
          Uusi ennakkotarkastus
        </PageTitle>
        {!operator || !season ? (
          <MessageContainer>
            <MessageView>Valitse liikennöitsijä ja kausi.</MessageView>
          </MessageContainer>
        ) : !inspection && !inspectionLoading ? (
          <MessageContainer>
            <MessageView>Haettu ennakkotarkastus ei löytynyt.</MessageView>
            <Button onClick={() => editPreInspection()}>Takaisin</Button>
          </MessageContainer>
        ) : (
          <>
            {inspection && (
              <>
                <StatusBox
                  style={{
                    backgroundColor: getInspectionStatusColor(inspection),
                    borderColor: getInspectionStatusColor(inspection),
                    color:
                      inspection.status === InspectionStatus.InReview
                        ? 'var(--dark-grey)'
                        : 'white',
                  }}>
                  <strong>{translate(inspection.status)}</strong>
                </StatusBox>
                <InspectionActionsRow
                  inspection={inspection}
                  onRefresh={refetch}
                  disabledActions={hasErrors ? ['submit', 'publish'] : []}
                />
              </>
            )}
            {hasErrors && (
              <MessageContainer>
                {(inspection?.inspectionErrors || []).map((err) => (
                  <ErrorView key={err}>{text(err)}</ErrorView>
                ))}
              </MessageContainer>
            )}
            {inspection?.status === InspectionStatus.InProduction ? (
              <PreInspectionEditor refetchData={refetch} />
            ) : (
              <Tabs>
                <PreInspectionEditor
                  name="create"
                  path="/"
                  label="Muokkaa"
                  loading={inspectionLoading}
                  refetchData={refetch}
                />
                <PreInspectionPreview path="preview" name="preview" label="Esikatsele" />
              </Tabs>
            )}
          </>
        )}
      </PreInspectionContext.Provider>
    </EditPreInspectionView>
  )
})

export default EditPreInspectionPage
