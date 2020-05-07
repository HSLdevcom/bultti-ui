import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { Operator, PreInspectionInput, Season } from '../schema-types'
import DepartureBlocks from '../departureBlock/DepartureBlocks'
import { useMutationData } from '../util/useMutationData'
import { updatePreInspectionMutation } from './preInspectionQueries'
import ProcurementUnits from '../procurementUnit/ProcurementUnits'
import { useStateValue } from '../state/useAppState'
import PreInspectionMeta from './PreInspectionMeta'
import PreInspectionConfig from './PreInspectionConfig'
import { TabChildProps } from '../common/components/Tabs'
import { PreInspectionContext } from './PreInspectionContext'
import { ButtonStyle } from '../common/components/Button'
import PreInspectionDevTools from '../dev/PreInspectionDevTools'
import { navigateWithQueryString } from '../util/urlValue'
import { SectionHeading } from '../common/components/Typography'
import PreInspectionExecutionRequirements from '../executionRequirement/PreInspectionExecutionRequirements'
import { PageSection } from '../common/components/common'

const EditPreInspectionView = styled.div`
  width: 100%;
  padding: 0 1.25rem;
`

type PreInspectionProps = {
  refetchData?: () => unknown
  loading?: boolean
} & TabChildProps

const PreInspectionEditor: React.FC<PreInspectionProps> = observer(
  ({ refetchData, loading }) => {
    var preInspection = useContext(PreInspectionContext)

    var [season] = useStateValue('globalSeason')
    var [operator] = useStateValue('globalOperator')

    let isUpdating = useRef(false)

    let [updatePreInspection, { loading: updateLoading }] = useMutationData(
      updatePreInspectionMutation
    )

    let onPreInspectionChange = useCallback(() => {
      if (refetchData) {
        refetchData()
      }
    }, [refetchData])

    let isLoading = useMemo(() => loading || updateLoading, [loading, updateLoading])

    // Update the pre-inspection on changes
    var updatePreInspectionValue = useCallback(
      async (name: keyof PreInspectionInput, value: string) => {
        if (!isUpdating.current && preInspection && !loading) {
          isUpdating.current = true

          var preInspectionInput: PreInspectionInput = {}
          preInspectionInput[name] = value

          await updatePreInspection({
            variables: {
              preInspectionId: preInspection.id,
              preInspectionInput,
            },
          })

          isUpdating.current = false
          await onPreInspectionChange()
        }
      },
      [isUpdating.current, preInspection, loading, updatePreInspection]
    )

    let createUpdateCallback = useCallback(
      (name) => (value) => updatePreInspectionValue(name, value),
      [updatePreInspectionValue]
    )

    let onMetaButtonAction = useCallback(() => {
      if (preInspection) {
        navigateWithQueryString(`/pre-inspection/edit/${preInspection.id}/preview`)
      }
    }, [preInspection])

    useEffect(() => {
      if (!preInspection || !operator || !season) {
        return
      }

      if (
        preInspection.operatorId !== operator.operatorId ||
        preInspection.seasonId !== season.id
      ) {
        navigateWithQueryString(`/pre-inspection/edit`)
      }
    }, [preInspection, operator, season])

    return (
      <EditPreInspectionView>
        {!!preInspection && (
          <>
            <PreInspectionMeta
              isLoading={isLoading}
              buttonStyle={ButtonStyle.SECONDARY}
              buttonAction={onMetaButtonAction}
              buttonLabel="Esikatsele"
            />

            <SectionHeading theme="light">Perustiedot</SectionHeading>
            <PreInspectionConfig onUpdateValue={createUpdateCallback} />

            <SectionHeading theme="light">Lähtöketjut</SectionHeading>
            <DepartureBlocks />

            <SectionHeading theme="light">Suoritevaatimus</SectionHeading>
            <PreInspectionExecutionRequirements />

            <SectionHeading theme="light">Kilpailukohteet</SectionHeading>
            <ProcurementUnits />

            <PageSection>
              <PreInspectionDevTools preInspection={preInspection} />
            </PageSection>
          </>
        )}
      </EditPreInspectionView>
    )
  }
)

export default PreInspectionEditor
