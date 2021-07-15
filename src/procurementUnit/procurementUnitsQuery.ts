import { gql } from '@apollo/client'
import { EquipmentFragment } from '../equipment/equipmentQuery'

export const ProcurementUnitFragment = gql`
  fragment ProcurementUnitFragment on ProcurementUnit {
    id
    procurementUnitId
    operatorId
    startDate
    endDate
    averageAgeRequirement
    optionsUsed
    area {
      id
      name
    }
    routes {
      routeId
    }
    currentContracts {
      id
      operatorId
      createdAt
      updatedAt
      description
      startDate
      endDate
    }
  }
`

export const procurementUnitsQuery = gql`
  query procurementUnitsByOperator(
    $operatorId: Int!
    $startDate: BulttiDate!
    $endDate: BulttiDate!
  ) {
    procurementUnitsByOperator(
      operatorId: $operatorId
      startDate: $startDate
      endDate: $endDate
    ) {
      ...ProcurementUnitFragment
    }
  }
  ${ProcurementUnitFragment}
`

export const procurementUnitQuery = gql`
  query procurementUnit(
    $procurementUnitId: String!
    $startDate: BulttiDate!
    $endDate: BulttiDate!
  ) {
    procurementUnit(
      procurementUnitId: $procurementUnitId
      startDate: $startDate
      endDate: $endDate
    ) {
      ...ProcurementUnitFragment
      equipmentCatalogues {
        id
        operatorId
        startDate
        endDate
        procurementUnitId
        operator {
          id
          operatorIds
          operatorName
        }
        equipmentQuotas {
          id
          percentageQuota
          equipment {
            ...EquipmentFragment
          }
        }
      }
    }
  }
  ${ProcurementUnitFragment}
  ${EquipmentFragment}
`

export const updateProcurementUnitMutation = gql`
  mutation updateProcurementUnit(
    $updatedData: ProcurementUnitEditInput!
    $procurementUnitId: String!
  ) {
    updateProcurementUnit(
      procurementUnit: $updatedData
      procurementUnitId: $procurementUnitId
    ) {
      ...ProcurementUnitFragment
    }
  }
  ${ProcurementUnitFragment}
`
