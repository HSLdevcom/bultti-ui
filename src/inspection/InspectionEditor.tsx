import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { Inspection, InspectionInput, InspectionStatus, InspectionType } from '../schema-types'
import { useMutationData } from '../util/useMutationData'
import {
  initInspectionContractUnitMap,
  inspectionQuery,
  updateInspectionMutation,
} from './inspectionQueries'
import { useStateValue } from '../state/useAppState'
import InspectionMeta from './InspectionMeta'
import InspectionConfig from './InspectionConfig'
import { TabChildProps } from '../common/components/Tabs'
import { navigateWithQueryString } from '../util/urlValue'
import { LoadingDisplay } from '../common/components/Loading'
import InspectionUsers from './InspectionUsers'
import PostInspectionEditor from '../postInspection/PostInspectionEditor'
import PreInspectionEditor from '../preInspection/PreInspectionEditor'
import InspectionValidationErrors from './InspectionValidationErrors'
import { Button } from '../common/components/buttons/Button'
import { getInspectionTypeStrings } from './inspectionUtils'

const EditInspectionView = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 1rem 0.75rem 2rem;
  background-color: var(--white-grey);
`

type InspectionEditorProps = {
  refetchData: () => unknown
  loading?: boolean
  inspection: Inspection
} & TabChildProps

const InspectionEditor: React.FC<InspectionEditorProps> = observer(
  ({ refetchData, loading, inspection }) => {
    var isEditable = inspection?.status === InspectionStatus.Draft

    var [season] = useStateValue('globalSeason')
    var [operator] = useStateValue('globalOperator')

    let isUpdating = useRef(false)

    let [initInspectionContractUnitMapQuery] = useMutationData(initInspectionContractUnitMap, {
      variables: {
        inspectionId: inspection.id,
      },
    })

    let [updatePreInspection, { loading: updateLoading }] = useMutationData(
      updateInspectionMutation,
      {
        refetchQueries: [
          { query: inspectionQuery, variables: { inspectionId: inspection?.id || '' } },
        ],
      }
    )

    let isLoading = useMemo(() => loading || updateLoading, [loading, updateLoading])

    let updatePreInspectionCb = useCallback(
      async (updatedValues: InspectionInput = {}) => {
        isUpdating.current = true

        await updatePreInspection({
          variables: {
            inspectionId: inspection.id,
            inspectionInput: updatedValues,
          },
        })

        isUpdating.current = false
        await refetchData()
      },
      [isUpdating.current, inspection, updatePreInspection, refetchData]
    )

    useEffect(() => {
      if (!inspection || !operator || !season) {
        return
      }

      if (inspection.operatorId !== operator.operatorId || inspection.seasonId !== season.id) {
        navigateWithQueryString(
          `/${getInspectionTypeStrings(inspection.inspectionType).path}-inspection/edit`
        )
      }
    }, [inspection, operator, season])

    let InspectionTypeEditor = useMemo(() => {
      if (inspection.inspectionType === InspectionType.Pre) {
        return PreInspectionEditor
      }

      if (inspection.inspectionType === InspectionType.Post) {
        return PostInspectionEditor
      }

      return React.Fragment
    }, [inspection])

    let hasErrors = inspection?.inspectionErrors?.length !== 0

    return (
      <EditInspectionView>
        <LoadingDisplay loading={isLoading} />
        {hasErrors && <InspectionValidationErrors inspection={inspection} />}
        {!!inspection && (
          <>
            {inspection.inspectionType === InspectionType.Pre && (
              <Button
                style={{ margin: '10px' }}
                onClick={() => initInspectionContractUnitMapQuery()}>
                Lukitse liitetyt sopimukset - Väliaikainen nappi (toimiakseen kaikilta
                kohteilta täytyy löytyä sopimus)
              </Button>
            )}
            <InspectionMeta inspection={inspection} />
            <InspectionUsers inspection={inspection} />
            <InspectionConfig inspection={inspection} saveValues={updatePreInspectionCb} />
            <InspectionTypeEditor
              inspection={inspection}
              isEditable={isEditable}
              refetchData={refetchData}
            />
          </>
        )}
      </EditInspectionView>
    )
  }
)

export default InspectionEditor
