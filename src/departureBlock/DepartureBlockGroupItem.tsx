import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useUploader } from '../util/useUploader'
import Checkbox from '../common/input/Checkbox'
import UploadFile from '../common/input/UploadFile'
import { LoadingDisplay } from '../common/components/Loading'
import styled from 'styled-components/macro'
import { DayTypeGroup, getEnabledDayTypes } from './departureBlocksCommon'
import { Button, ButtonStyle } from '../common/components/buttons/Button'
import { useMutationData } from '../util/useMutationData'
import { removeDepartureBlocks, uploadDepartureBlocksMutation } from './blockDeparturesQuery'
import { InspectionContext } from '../inspection/InspectionContext'
import { ErrorView, SuccessView } from '../common/components/Messages'

const DepartureBlockGroupContainer = styled.div`
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-bottom: 1px solid var(--lighter-grey);
  position: relative;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: 0;
    margin-bottom: 0;
  }
`

const DayTypesContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: baseline;
`

const DayTypeOption = styled.div`
  margin-right: 0.5rem;
`

const ResetButton = styled(Button).attrs(() => ({
  buttonStyle: ButtonStyle.SECONDARY_REMOVE,
}))`
  margin-left: auto;
`

type PropTypes = {
  loading?: boolean
  isEditable: boolean
  selectableDayTypes?: string[]
  hasDepartures: boolean
  dayTypeGroup: DayTypeGroup
  groupIndex: number
  onAddDayType: (dayType: string, groupIndex: number) => DayTypeGroup[]
  onRemoveDayType: (dayType: string, groupIndex: number) => DayTypeGroup[]
  onBlocksChange: () => void
}

const DepartureBlockGroupItem: React.FC<PropTypes> = observer(
  ({
    isEditable,
    selectableDayTypes = [],
    dayTypeGroup,
    loading = false,
    groupIndex,
    onAddDayType,
    onRemoveDayType,
    onBlocksChange,
    hasDepartures,
  }) => {
    let [showBlocksLoading, setShowBlocksLoading] = useState(loading)

    let { inspection } = useContext(InspectionContext)
    let inspectionId = inspection?.id || ''

    useEffect(() => {
      if (!loading) {
        setShowBlocksLoading(false)
      }
    }, [loading])

    // The state of the file input.
    const [fileValue, setFileValue] = useState<File[]>([])

    // Create an upload handler for uploading the departure block file.
    const uploader = useUploader(uploadDepartureBlocksMutation, {
      variables: {
        inspectionId: inspectionId,
        dayTypes: getEnabledDayTypes(dayTypeGroup),
      },
    })

    const [
      ,
      { data: uploadedData, loading: uploadLoading, uploadError: uploadFileError },
    ] = uploader

    useEffect(() => {
      if (uploadedData && !uploadLoading) {
        onBlocksChange()
      }
    }, [onBlocksChange, uploadLoading, uploadedData])

    const [removeDepartureBlocksForDays, { loading: removeBlocksLoading }] = useMutationData(
      removeDepartureBlocks
    )

    let isLoading = useMemo(
      () => removeBlocksLoading || ((hasDepartures || showBlocksLoading) && uploadLoading),
      [uploadLoading, hasDepartures, showBlocksLoading, removeBlocksLoading]
    )

    // The group is disabled when there are no departures.
    let isDisabled = hasDepartures

    // Handle day type selection.
    const onDayTypeChange = useCallback(
      (dayType: string, isSelected) => {
        if (isLoading || isDisabled) {
          return
        }

        if (isSelected) {
          onAddDayType(dayType, groupIndex)
        } else {
          onRemoveDayType(dayType, groupIndex)
        }
      },
      [groupIndex, onAddDayType, onRemoveDayType, isDisabled, isLoading]
    )

    // Reset the file value (upload input value) and remove all blocks from the group.
    const onReset = useCallback(async () => {
      if (
        isEditable &&
        confirm(
          'Olet poistamassa kaikki tähän päiväryhmään kuuluvat lähtöketjut. Uusi lähtöketjutiedosto on ladattava. Ok?'
        )
      ) {
        setFileValue([])
        setShowBlocksLoading(true)

        await removeDepartureBlocksForDays({
          variables: {
            dayTypes: getEnabledDayTypes(dayTypeGroup),
            inspectionId: inspectionId,
          },
        })

        onBlocksChange()
      }
    }, [dayTypeGroup, inspectionId, removeDepartureBlocksForDays, onBlocksChange, isEditable])

    return (
      <DepartureBlockGroupContainer>
        <DayTypesContainer>
          {Object.entries(dayTypeGroup).map(([dt, enabled]) => (
            <DayTypeOption key={dt}>
              <Checkbox
                disabled={
                  !isEditable ||
                  isDisabled ||
                  (selectableDayTypes?.length !== 0 && !selectableDayTypes.includes(dt))
                }
                label={dt}
                onChange={(e) => onDayTypeChange(dt, e.target.checked)}
                checked={enabled}
                name="daytype"
                value={dt}
              />
            </DayTypeOption>
          ))}
          {isEditable && hasDepartures && !isLoading && (
            <ResetButton style={{ marginLeft: 'auto' }} onClick={onReset}>
              Poista kaikki ryhmän lähtöketjut
            </ResetButton>
          )}
        </DayTypesContainer>
        {isEditable && (!hasDepartures || fileValue.length !== 0) && (
          <UploadFile
            disabled={loading || isDisabled}
            label="Lataa lähtöketjutiedosto"
            uploader={uploader}
            value={fileValue}
            onChange={setFileValue}
          />
        )}
        <LoadingDisplay loading={isLoading} />
        {hasDepartures && (
          <>
            <SuccessView>
              Tällä päiväryhmällä on lähtöketjuja ja se ei ole muokattavissa.
            </SuccessView>
            {uploadFileError && <ErrorView>{uploadFileError.message}</ErrorView>}
          </>
        )}
      </DepartureBlockGroupContainer>
    )
  }
)

export default DepartureBlockGroupItem
