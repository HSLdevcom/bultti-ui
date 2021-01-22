import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { eachWeekOfInterval, parseISO, startOfWeek } from 'date-fns'
import { InspectionDate, InspectionInput, InspectionType } from '../schema-types'
import Dropdown from '../common/input/Dropdown'
import { readableDateRange } from '../util/formatDate'
import { useLazyQueryData } from '../util/useLazyQueryData'
import { allInspectionDatesQuery } from './inspectionDate/inspectionDateQuery'
import { LoadingDisplay } from '../common/components/Loading'

const InspectionSelectDatesView = styled.div`
  margin: 1rem 0;
  width: 50%;
`

interface DateOption {
  label: string
  value: {
    startDate: Date
    endDate: Date
  }
}

export type PropTypes = {
  inspectionType: InspectionType
  inspectionInput: InspectionInput
  onChange: (startDate: Date, endDate: Date) => void
}

const InspectionSelectDates = observer(
  ({ inspectionType, inspectionInput, onChange }: PropTypes) => {
    let [
      queryInspectionDates,
      { data: inspectionDatesQueryResult, loading: areInspectionDatesLoading },
    ] = useLazyQueryData<InspectionDate[]>(allInspectionDatesQuery)

    let _queryPostinspectionDateOptions = async () => {
      if (!areInspectionDatesLoading && !inspectionDatesQueryResult) {
        await queryInspectionDates()
      }
    }

    let dateOptions: DateOption[] = []
    if (inspectionType === InspectionType.Pre) {
      dateOptions = _getPreInspectionDateOptions()
    } else {
      if (inspectionDatesQueryResult) {
        dateOptions = _getPostInspectionDateOptions(inspectionDatesQueryResult)
      } else {
        _queryPostinspectionDateOptions()
      }
    }
    dateOptions.sort((a: DateOption, b: DateOption) => {
      return a.value.startDate.getTime() < b.value.startDate.getTime() ? -1 : 1
    })

    let onSelectDates = (dateOption: DateOption) => {
      onChange(dateOption.value.startDate, dateOption.value.endDate)
    }
    let selectedItem: DateOption | null =
      inspectionInput.inspectionStartDate && inspectionInput.inspectionEndDate
        ? {
            label: readableDateRange({
              startDate: inspectionInput.inspectionStartDate,
              endDate: inspectionInput.inspectionEndDate,
            }),
            value: {
              startDate: inspectionInput.inspectionStartDate,
              endDate: inspectionInput.inspectionEndDate!,
            },
          }
        : null
    return (
      <InspectionSelectDatesView>
        {areInspectionDatesLoading ? (
          <LoadingDisplay />
        ) : (
          <Dropdown
            label={'Valitse tarkastusjakso'}
            items={dateOptions}
            onSelect={onSelectDates}
            selectedItem={selectedItem}
          />
        )}
      </InspectionSelectDatesView>
    )
  }
)

const _getPreInspectionDateOptions = (): DateOption[] => {
  let startDate = new Date()
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 90)
  let dateOptionsEndDates = eachWeekOfInterval({
    start: startDate,
    end: endDate,
  })

  let dateOptions: DateOption[] = dateOptionsEndDates.map((endDate) => {
    let startDate = startOfWeek(endDate, { weekStartsOn: 1 })
    let value = {
      startDate,
      endDate,
    }
    let label = readableDateRange({ startDate, endDate })
    return {
      label,
      value,
    }
  })
  return dateOptions
}

const _getPostInspectionDateOptions = (
  inspectionDatesQueryResult: InspectionDate[]
): DateOption[] => {
  return inspectionDatesQueryResult.map((inspectionDate: InspectionDate) => {
    let { startDate, endDate } = inspectionDate
    let label = readableDateRange({ startDate, endDate })
    return {
      label,
      value: {
        startDate: parseISO(startDate),
        endDate: parseISO(endDate),
      },
    }
  })
}

export default InspectionSelectDates
