import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Input from '../common/input/Input'
import { isEqual, pick, uniqueId } from 'lodash'
import { FormColumn } from '../common/components/form'
import { Inspection, InspectionInput, InspectionStatus } from '../schema-types'
import { MessageContainer, MessageView } from '../common/components/Messages'
import { FlexRow, PageSection } from '../common/components/common'
import { Button, ButtonStyle } from '../common/components/buttons/Button'
import { ActionsWrapper, FieldLabel } from '../common/input/ItemForm'
import styled from 'styled-components/macro'
import InspectionTimeline from './InspectionTimeline'
import InspectionSelectDates from './inspectionSelectDates'
import { getDateString } from '../util/formatDate'
import { Text, text } from '../util/translate'
import { usePromptUnsavedChanges } from '../util/promptUnsavedChanges'
import DatePicker from '../common/input/DatePicker'
import { addDays, max, parseISO } from 'date-fns'
import { InspectionContext } from './InspectionContext'

const InspectionConfigView = styled(PageSection)`
  margin: 1rem 0 0;
  padding: 0 1rem 1rem;
`

const ProductionDatePickers = styled(FlexRow)`
  div:first-of-type {
    margin-right: 0.25rem;
  }
`

export type PropTypes = {
  inspection: Inspection
  saveValues: (updatedValues: InspectionInput) => Promise<unknown>
}

const InspectionConfig: React.FC<PropTypes> = observer(({ saveValues, inspection }) => {
  let [isDirty, setIsDirty] = useState<boolean>(false)

  let initialInspectionInputValues = useMemo(() => {
    let minStartDate = parseISO(inspection.minStartDate)
    let startDate = inspection.startDate ? parseISO(inspection.startDate) : minStartDate
    startDate = max([startDate, minStartDate])

    let endDate = inspection.endDate ? parseISO(inspection.endDate) : addDays(startDate, 1)
    endDate = max([addDays(startDate, 1), endDate])

    return {
      startDate: getDateString(startDate),
      endDate: getDateString(endDate),
      name: inspection.name || '',
      inspectionDateId: inspection.inspectionDateId,
      inspectionStartDate: inspection.inspectionStartDate || '',
      inspectionEndDate: inspection.inspectionEndDate || '',
    }
  }, [inspection])

  let [
    pendingInspectionInputValues,
    setPendingInspectionInputValues,
  ] = useState<InspectionInput>(initialInspectionInputValues)

  useEffect(() => {
    let isDirty = !isEqual(
      // Pick only props existing on the pending inspection input for comparison
      pick(inspection, Object.keys(pendingInspectionInputValues)),
      pendingInspectionInputValues
    )
    setIsDirty(isDirty)
  }, [pendingInspectionInputValues, inspection])

  let onUpdateValue = useCallback((name: string, value: any) => {
    setPendingInspectionInputValues((currentValues) => {
      let nextValues: InspectionInput = { ...currentValues }
      nextValues[name] = value
      return nextValues
    })
  }, [])

  let onChangeInspectionDate = useCallback((startDate: Date, endDate: Date, id?: string) => {
    if (id) {
      onUpdateValue('inspectionDateId', id)
    }

    onUpdateValue('inspectionStartDate', getDateString(startDate))
    onUpdateValue('inspectionEndDate', getDateString(endDate))
  }, [])

  let onSave = useCallback(async () => {
    await saveValues(pendingInspectionInputValues!)
  }, [pendingInspectionInputValues])

  // let isDirty = useMemo(
  //   () =>
  //     !isEqual(
  //       // Pick only props existing on the pending inspection input for comparison
  //       pick(inspection, Object.keys(pendingInspectionInputValues)),
  //       pendingInspectionInputValues
  //     ),
  //   [pendingInspectionInputValues, inspection]
  // )

  const formId = useMemo(() => uniqueId(), [])
  usePromptUnsavedChanges({ uniqueComponentId: formId, shouldShowPrompt: isDirty })

  return (
    <InspectionConfigView>
      <InspectionContext.Provider value={{ isDirty }}>
        {!inspection ? (
          <MessageContainer>
            <MessageView>
              <Text>inspection_inspectionNotSelected</Text>
            </MessageView>
          </MessageContainer>
        ) : (
          <>
            <FlexRow>
              <FormColumn>
                <Input
                  value={pendingInspectionInputValues.name || ''}
                  label={text('inspection_inspectionName')}
                  onChange={(value: string) => {
                    onUpdateValue('name', value)
                  }}
                />
              </FormColumn>
            </FlexRow>
            <FlexRow>
              <InspectionTimeline currentInspection={inspection} />
            </FlexRow>
            <FlexRow>
              <InspectionSelectDates
                inspectionType={inspection.inspectionType}
                isEditingDisabled={inspection.status !== InspectionStatus.Draft}
                inspectionInput={pendingInspectionInputValues}
                onChange={onChangeInspectionDate}
              />
            </FlexRow>
            <FieldLabel style={{ textTransform: 'uppercase' }}>
              <Text>inspection_selectProductionDate</Text>
            </FieldLabel>
            <ProductionDatePickers>
              <DatePicker
                value={getDateString(pendingInspectionInputValues.startDate)}
                minDate={inspection.minStartDate}
                maxDate={inspection.season.endDate}
                onChange={(dateString: string | null) => {
                  if (dateString) {
                    onUpdateValue('startDate', getDateString(dateString))
                  }
                }}
                acceptableDayTypes={['Ma']}
                disabled={inspection.status !== InspectionStatus.Draft}
              />
              <DatePicker
                value={getDateString(pendingInspectionInputValues.endDate)}
                maxDate={inspection.season.endDate}
                onChange={(dateString: string | null) => {
                  if (dateString) {
                    onUpdateValue('endDate', getDateString(dateString))
                  }
                }}
                acceptableDayTypes={['Su']}
                disabled={inspection.status !== InspectionStatus.Draft}
              />
            </ProductionDatePickers>
            <FlexRow>
              <ActionsWrapper>
                <Button style={{ marginRight: '1rem' }} onClick={onSave} disabled={!isDirty}>
                  <Text>save</Text>
                </Button>
                <Button
                  buttonStyle={ButtonStyle.SECONDARY_REMOVE}
                  onClick={() =>
                    setPendingInspectionInputValues(initialInspectionInputValues)
                  }>
                  <Text>cancel</Text>
                </Button>
              </ActionsWrapper>
            </FlexRow>
          </>
        )}
      </InspectionContext.Provider>
    </InspectionConfigView>
  )
})

export default InspectionConfig
