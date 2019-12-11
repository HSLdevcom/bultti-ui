import React, { useEffect } from 'react'
import styled from 'styled-components'
import { observer, useLocalStore } from 'mobx-react-lite'
import { ColumnWrapper, FormHeading, HalfWidth } from '../components/common'
import SelectOperator from '../inputs/SelectOperator'
import SelectSeason from '../inputs/SelectSeason'
import WeeklyExecutionRequirements from '../inputs/WeeklyExecutionRequirements'
import { DepartureBlock, ExecutionRequirement, Season } from '../types/inspection'
import { Operator } from '../schema-types'
import SelectWeek from '../inputs/SelectWeek'
import { useStateValue } from '../state/useAppState'

const CreatePreInspectionFormView = styled(ColumnWrapper)``
const FormColumn = styled(HalfWidth)``

const ControlGroup = styled.div`
  margin: 0 0 2rem;
`

interface PreInspectionFormActions {
  selectOperator: (operator: Operator | null) => void
  selectSeason: (season: Season | null) => void
  changeRequirements: (executionRequirements: ExecutionRequirement[]) => void
  setRequirement: (requirement: ExecutionRequirement, nextValue: string) => void
  setDepartureBlocks: (departureBlocks: DepartureBlock[]) => void
  setStartDate: (startDate: string) => void
  setEndDate: (endDate: string) => void
  setProductionStartDate: (startDate: string) => void
  setProductionEndDate: (endDate: string) => void
}

interface PreInspectionFormData extends PreInspectionFormActions {
  operator: Operator | null
  season: Season | null
  executionRequirements: ExecutionRequirement[]
  startDate: string
  endDate: string
  productionStart: string
  productionEnd: string
  departureBlocks: DepartureBlock[]
}

const CreatePreInspectionForm: React.FC = observer(() => {
  const [globalOperator] = useStateValue('globalOperator')

  const formState = useLocalStore<PreInspectionFormData>(() => ({
    operator: globalOperator || null,
    season: null,
    executionRequirements: [],
    startDate: '2019-12-09',
    endDate: '2019-12-15',
    productionStart: '',
    productionEnd: '2019-12-31',
    departureBlocks: [],
    selectOperator: (operator = null) => {
      formState.operator = operator
    },
    selectSeason: (season = null) => {
      formState.season = season
    },
    changeRequirements: (executionRequirements = []) => {
      formState.executionRequirements = executionRequirements
    },
    setRequirement: (requirement: ExecutionRequirement, nextValue) => {
      requirement.requirement = nextValue
    },
    setDepartureBlocks: (departureBlocks = []) => {
      formState.departureBlocks = departureBlocks
    },
    setStartDate: (startDate: string = '') => {
      formState.startDate = startDate
    },
    setEndDate: (endDate: string = '') => {
      formState.endDate = endDate
    },
    setProductionStartDate: (startDate: string = '') => {
      formState.productionStart = startDate
    },
    setProductionEndDate: (endDate: string = '') => {
      formState.productionEnd = endDate
    },
  }))

  useEffect(() => {
    if (formState.operator?.id !== globalOperator?.id) {
      formState.selectOperator(globalOperator)
    }
  }, [globalOperator])

  return (
    <CreatePreInspectionFormView>
      <FormColumn style={{ flex: '1 1 45%' }}>
        <ControlGroup>
          <SelectOperator
            label="Liikennöitsijä"
            theme="light"
            value={formState.operator}
            onSelect={formState.selectOperator}
          />
        </ControlGroup>
        <ControlGroup>
          <SelectSeason
            label="Aikataulukausi"
            theme="light"
            value={formState.season}
            onSelect={formState.selectSeason}
          />
        </ControlGroup>
        <FormHeading theme="light">Tarkastusjakso</FormHeading>
        <ControlGroup>
          <SelectWeek
            startLabel="Alku"
            endLabel="Loppu"
            startDate={formState.startDate}
            onChangeStartDate={formState.setStartDate}
            endDate={formState.endDate}
            onChangeEndDate={formState.setEndDate}
          />
        </ControlGroup>
      </FormColumn>
      <FormColumn style={{ flex: '1 1 55%' }}>
        <FormHeading theme="light">Suoritevaatimukset</FormHeading>
        <WeeklyExecutionRequirements
          startDate={formState.startDate}
          endDate={formState.productionEnd}
          requirements={formState.executionRequirements}
          onReplace={formState.changeRequirements}
          onChange={formState.setRequirement}
        />
      </FormColumn>
    </CreatePreInspectionFormView>
  )
})

export default CreatePreInspectionForm
