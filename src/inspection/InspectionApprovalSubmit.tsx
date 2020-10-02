import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import SelectDate from '../common/input/SelectDate'
import { ControlGroup, FormColumn, InputLabel } from '../common/components/form'
import { Inspection } from '../schema-types'
import { FlexRow } from '../common/components/common'
import { Button, ButtonStyle } from '../common/components/Button'
import { ActionsWrapper } from '../common/input/ItemForm'
import styled from 'styled-components'
import { addDays, format, max, parseISO } from 'date-fns'
import { DATE_FORMAT } from '../constants'
import { LoadingDisplay } from '../common/components/Loading'

const InspectionConfigView = styled.div`
  border: 1px solid var(--lighter-grey);
  border-radius: 0.5rem;
  background: white;
  padding: 0 1rem 1rem;
  margin: 0 1rem 1rem;
  position: relative;
`

export type PropTypes = {
  inspection: Inspection
  onSubmit: (startDate: string, endDate: string) => Promise<unknown>
  onCancel: () => unknown
  loading?: boolean
  disabled: boolean
}

type InspectionDateValues = {
  startDate: string
  endDate: string
}

const InspectionApprovalSubmit: React.FC<PropTypes> = observer(
  ({ inspection, onSubmit, onCancel, loading = false, disabled = false }) => {
    let getValuesFromInspection = useCallback((setFromInspection: Inspection) => {
      let minStartDate = parseISO(setFromInspection.minStartDate)

      let startDate = setFromInspection.startDate
        ? parseISO(setFromInspection.startDate)
        : minStartDate

      startDate = max([startDate, minStartDate])

      let endDate = setFromInspection.endDate
        ? parseISO(setFromInspection.endDate)
        : addDays(startDate, 1)

      endDate = max([addDays(startDate, 1), endDate])

      return {
        startDate: format(startDate, DATE_FORMAT),
        endDate: format(endDate, DATE_FORMAT),
      }
    }, [])

    let [inspectionValues, setInspectionValues] = useState<InspectionDateValues>(
      getValuesFromInspection(inspection)
    )

    let onUpdateValue = useCallback((name, value) => {
      setInspectionValues((currentValues) => {
        let nextValues: InspectionDateValues = { ...currentValues }
        nextValues[name] = value
        return nextValues
      })
    }, [])

    let onSubmitValues = useCallback(async () => {
      await onSubmit(inspectionValues.startDate, inspectionValues.endDate)
    }, [inspectionValues])

    useEffect(() => {
      let values = getValuesFromInspection(inspection)
      setInspectionValues(values)
    }, [inspection])

    return (
      <InspectionConfigView>
        <LoadingDisplay loading={loading} />
        <FlexRow>
          <FormColumn>
            <InputLabel theme="light">Tuotantojakso</InputLabel>
            <ControlGroup>
              <SelectDate
                name="production_start"
                value={inspectionValues.startDate}
                minDate={inspection.minStartDate}
                maxDate={inspection.season.endDate}
                onChange={(val) => onUpdateValue('startDate', val)}
                label="Alku"
                alignDatepicker="left"
              />
              <SelectDate
                name="production_start"
                value={inspectionValues.endDate}
                minDate={format(
                  addDays(parseISO(inspection.startDate || inspection.minStartDate), 1),
                  DATE_FORMAT
                )}
                maxDate={inspection.season.endDate}
                onChange={(val) => onUpdateValue('startDate', val)}
                label="Loppu"
              />
            </ControlGroup>
          </FormColumn>
        </FlexRow>
        <FlexRow>
          <ActionsWrapper>
            <Button
              disabled={disabled}
              style={{ marginRight: '1rem' }}
              onClick={onSubmitValues}>
              Lähetä hyväksyttäväksi
            </Button>
            <Button buttonStyle={ButtonStyle.SECONDARY_REMOVE} onClick={onCancel}>
              Peruuta
            </Button>
          </ActionsWrapper>
        </FlexRow>
      </InspectionConfigView>
    )
  }
)

export default InspectionApprovalSubmit