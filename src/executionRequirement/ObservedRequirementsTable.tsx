import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Table from '../common/components/Table'
import { isNumeric } from '../util/isNumeric'
import { ObservedExecutionRequirement, ObservedExecutionValue } from '../schema-types'
import { lowerCase, orderBy, pick } from 'lodash'
import ValueDisplay from '../common/components/ValueDisplay'
import { getTotal } from '../util/getTotal'
import { round } from '../util/round'

const ExecutionRequirementsAreaContainer = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 1rem;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: 0;
  }
`

export type PropTypes = {
  executionRequirement: ObservedExecutionRequirement
}

const valuesLayoutColumnLabels: { [key in keyof ObservedExecutionValue]?: string } = {
  emissionClass: 'Päästöluokka',
  kilometersRequired: 'Km vaatimus',
  quotaRequired: '% Osuus',
  equipmentCountRequired: 'Vaatimus kpl',
  kilometersObserved: 'Toteuma km',
  quotaObserved: 'Toteuma % osuus',
  differencePercentage: '% ero',
  cumulativeDifferencePercentage: 'Kumul. % ero',
  equipmentCountObserved: 'Toteuma kpl',
  averageAgeWeightedRequired: 'Suun. painotettu keski-ikä',
  averageAgeWeightedObserved: 'Tot. painotettu keski-ikä',
  sanctionThreshold: 'Sanktioraja',
  sanctionablePercentage: 'Sanktioitavat',
  sanctionAmount: 'Sanktiomäärä',
}

const ObservedRequirementsTable: React.FC<PropTypes> = observer(({ executionRequirement }) => {
  let requirementRows = useMemo(() => {
    let requirementValues = executionRequirement.observedRequirements
    return orderBy(requirementValues, 'emissionClass', 'desc')
  }, [executionRequirement])

  let renderDisplayValue = useCallback((key, val) => {
    let displayVal = round(val, 6)
    let displayUnit = lowerCase(key).includes('kilo') ? 'km' : 'vuotta'

    return `${displayVal} ${displayUnit}`
  }, [])

  let renderTableValue = useCallback((key, val, isHeader = false, item) => {
    if (isHeader || ['unit'].includes(key || '') || !isNumeric(val) || val === 0) {
      return val
    }

    let unit = ''

    switch (item.unit || key) {
      case 'quotaRequired':
      case 'quotaObserved':
      case 'differencePercentage':
      case 'cumulativeDifferencePercentage':
      case 'sanctionThreshold':
      case 'sanctionablePercentage':
      case 'sanctionAmount':
        unit = '%'
        break
      case 'kilometersRequired':
      case 'kilometersObserved':
        unit = 'km'
        break
      case 'equipmentCountRequired':
        unit = 'kpl'
        break
      default:
        unit = ''
    }

    return `${round(val, 6)} ${unit}`
  }, [])

  let { averageAgeWeightedObserved, averageAgeWeightedRequired } = executionRequirement

  let getColumnTotal = useCallback(
    (key: string) => {
      if (['emissionClass', 'sanctionThreshold'].includes(key)) {
        return ''
      }

      let totalVal = round(getTotal<any, string>(requirementRows, key))

      switch (key) {
        case 'quotaRequired':
        case 'quotaObserved':
        case 'differencePercentage':
        case 'cumulativeDifferencePercentage':
        case 'sanctionablePercentage':
        case 'sanctionAmount':
          return `${round(totalVal, 6)}%`
        case 'kilometersRequired':
        case 'kilometersObserved':
          return `${round(totalVal, 6)} km`
        case 'equipmentCountRequired':
        case 'equipmentCountObserved':
          return `${totalVal} kpl`
        case 'averageAgeWeightedObserved':
          return `${round(averageAgeWeightedObserved || 0, 6)} v`
        case 'averageAgeWeightedRequired':
          return `${round(averageAgeWeightedRequired || 0, 6)} v`
        default:
          return totalVal
      }
    },
    [executionRequirement]
  )

  return (
    <ExecutionRequirementsAreaContainer>
      <ValueDisplay
        valuesPerRow={3}
        style={{ marginBottom: '1rem' }}
        item={pick(executionRequirement, [
          'totalKilometersRequired',
          'averageAgeWeightedRequired',
          'averageAgeWeightedObserved',
        ])}
        labels={{
          totalKilometersRequired: 'Suoritekilometrit yhteensä',
          averageAgeWeightedRequired: 'Suunniteltu painotettu keski-ikä',
          averageAgeWeightedObserved: 'Toteutunut painotettu keski-ikä',
        }}
        renderValue={renderDisplayValue}
      />
      <Table<any>
        items={requirementRows}
        columnLabels={valuesLayoutColumnLabels}
        renderValue={renderTableValue}
        keyFromItem={(item) => item.emissionClass}
        getColumnTotal={getColumnTotal}
      />
    </ExecutionRequirementsAreaContainer>
  )
})

export default ObservedRequirementsTable