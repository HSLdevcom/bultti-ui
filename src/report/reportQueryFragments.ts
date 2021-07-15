/**
 * This file contains GraphQL fragments for all report data items. Common fields can be
 * extracted into strings and reused in many fragments.
 *
 * The name of the fragment should be the capitalized name of the report and appended with
 * "Fragment". The report names are listed in reportNames.ts in the server repo.
 */

let departureReportBaseFragment = `
id
dayType
direction
journeyEndTime
journeyStartTime
routeId
trackReason
`

let observedDepartureReportBaseFragment = `
${departureReportBaseFragment}
date
observedArrivalTime
observedDepartureTime
sanctionAmount
sanctionedKilometers
`

let emissionClassExecutionBaseFragment = `
id
procurementUnitId
class1
class2
class3
class4
class5
class6
class7
class8
class9
class10
`

let departurePairBaseFragment = `
id
dayType
aRouteId
aDirection
aJourneyStartTime
aJourneyEndTime
aOriginStop
aDestinationStop
aTerminalTime
aRecoveryTime
bRouteId
bDirection
bJourneyStartTime
bJourneyEndTime
bOriginStop
bDestinationStop
bTerminalTime
bRecoveryTime
blockNumber
equipmentRotation
schemaId
deadrunMinutes
deadrunPlannedBy
`

// The keys should match the capitalized reportName + 'Fragment'.
// Example: report name 'trackedDepartures' becomes fragment name 'TrackedDeparturesFragment'
// language=GraphQL
export const reportQueryFragments = {
  TrackedDeparturesFragment: `
    fragment TrackedDeparturesFragment on TrackedDeparturesReportData {
      ${departureReportBaseFragment}      
    }
  `,
  EmissionClassExecutionFragment: `
    fragment EmissionClassExecutionFragment on EmissionClassExecutionReportData {
      ${emissionClassExecutionBaseFragment}
    }
  `,
  ObservedEmissionClassExecutionFragment: `
    fragment ObservedEmissionClassExecutionFragment on ObservedEmissionClassExecutionReportData {
      ${emissionClassExecutionBaseFragment}
    }
  `,
  ObservedUnitExecutionFragment: `
    fragment ObservedUnitExecutionFragment on ObservedUnitExecution {
      id
      procurementUnitId
      totalKilometersObserved
      totalUnitKilometers
      averageAgeMax
      averageAgeObserved
      averageAgeRequired
      averageAgeWeightedObserved
      sanctionPercentageAmount
      sanctionFinancialAmount
    }
  `,
  ObservedLateDeparturesFragment: `
    fragment ObservedLateDeparturesFragment on LateDeparturesReportData {
      ${observedDepartureReportBaseFragment}
      journeyKilometers
      observedLateArrivalSeconds
      observedLateDepartureSeconds
      procurementUnitId
      registryNr
    }
  `,
  ObservedOverageDeparturesFragment: `
    fragment ObservedOverageDeparturesFragment on ObservedOverAgeDeparturesReportData {
      ${observedDepartureReportBaseFragment}
      registryNr
      procurementUnitId
      observedEquipmentAge
      overAgeType
      journeyKilometers
    }
  `,
  ObservedEquipmentColorFragment: `
    fragment ObservedEquipmentColorFragment on ObservedEquipmentColorReportData {
      ${observedDepartureReportBaseFragment}
      registryNr
      isTrunkRoute
      observedExteriorColor
      journeyKilometers
      procurementUnitId
    }
  `,
  ObservedEquipmentTypeFragment: `
    fragment ObservedEquipmentTypeFragment on ObservedEquipmentTypeReportData {
      ${observedDepartureReportBaseFragment}
      registryNr
      journeyKilometers
      procurementUnitId
      equipmentTypeRequired
      observedEquipmentType
      plannedEquipmentType
    }
  `,
  ObservedExecutionRequirementsFragment: `
    fragment ObservedExecutionRequirementsFragment on ObservedExecutionRequirementsReportData {
      id
      operatorId
      areaName
      startDate
      endDate
      totalKilometersRequired
      totalKilometersObserved
      observedRequirements {
        id
        emissionClass
        kilometersRequired
        quotaRequired
        kilometersObserved
        quotaObserved
        differencePercentage
        cumulativeDifferencePercentage
        equipmentCountRequired
        equipmentCountObserved
        sanctionThreshold
        sanctionablePercentage
        sanctionAmount
      }
    }
  `,
  EarlyTimingStopDeparturesFragment: `
    fragment EarlyTimingStopDeparturesFragment on EarlyTimingStopDeparturesReportData {
      ${departureReportBaseFragment}
      date
      stopId
      procurementUnitId
      plannedDepartureTime
      observedDepartureTime
      observedDepartureDifferenceSeconds
      journeyKilometers
    }
  `,
  BlockDeviationsFragment: `
    fragment BlockDeviationsFragment on DeviationsReportData {
      ${departureReportBaseFragment}
      overlapSeconds
      overlapPlannedBy
      registryNr
    }
  `,
  AllDeviationsFragment: `
    fragment AllDeviationsFragment on DeviationsReportData {
      ${departureReportBaseFragment}
      overlapSeconds
      overlapPlannedBy
      registryNr
    }
  `,
  DeadrunsFragment: `
    fragment DeadrunsFragment on DeadrunsReportData {
      ${departurePairBaseFragment}
    }
  `,
  OperatorDeadrunsFragment: `
    fragment OperatorDeadrunsFragment on DeadrunsReportData {
      ${departurePairBaseFragment}
    }
  `,
  DepartureBlocksFragment: `
    fragment DepartureBlocksFragment on DepartureBlocksReportData {
      id
      dayType
      routeId
      direction
      journeyStartTime
      journeyEndTime
      blockNumber
      journeyType
      registryNr
      vehicleId
    }
  `,
  EquipmentColorFragment: `
    fragment EquipmentColorFragment on EquipmentColorReportData {
      ${departureReportBaseFragment}
      registryNr
      isTrunkRoute
      equipmentExteriorColor
    }
  `,
  EquipmentTypeFragment: `
    fragment EquipmentTypeFragment on EquipmentTypeReportData {
      ${departureReportBaseFragment}
      registryNr
      plannedEquipmentType
      observedEquipmentType
      equipmentTypeRequired
    }
  `,
  ExecutionRequirementsFragment: `
    fragment ExecutionRequirementsFragment on ExecutionRequirementsReportData {
      id
      operatorId
      areaName
      totalKilometers
      totalKilometersFulfilled
      averageAgeWeighted
      averageAgeWeightedFulfilled
      requirements {
        emissionClass
        kilometerRequirement
        kilometersFulfilled
        quotaRequirement
        quotaFulfilled
        equipmentCount
        equipmentCountFulfilled
        differencePercentage
        cumulativeDifferencePercentage
        sanctionAmount
        sanctionThreshold
        classSanctionAmount
      }
    }
  `,
  ExtraBlockDeparturesFragment: `
    fragment ExtraBlockDeparturesFragment on ExtraBlockDeparturesReportData {
      ${departureReportBaseFragment}
    }
  `,
  MissingBlockDeparturesFragment: `
    fragment MissingBlockDeparturesFragment on MissingBlockDeparturesReportData {
      ${departureReportBaseFragment}
    }
  `,
  MissingEquipmentFragment: `
    fragment MissingEquipmentFragment on MissingEquipmentReportData {
      id
      registryNr
      vehicleId
      blockNumber
    }
  `,
  OverageDeparturesFragment: `
    fragment OverageDeparturesFragment on OverAgeDeparturesReportData {
      ${departureReportBaseFragment}
      registryNr
      overAgeType
      observedEquipmentAge
    }
  `,
  UnitExecutionFragment: `
    fragment UnitExecutionFragment on UnitExecutionReportData {
      id
      procurementUnitId
      kilometersRequired
      kilometersFulfilled
      averageAgeMax
      averageAgeRequired
      averageAgeWeighted
      averageAgeWeightedFulfilled
    }
  `,
  UnobservedDeparturesFragment: `
    fragment UnobservedDeparturesFragment on UnobservedDeparturesReportData {
      ${departureReportBaseFragment}
      journeyKilometers
      procurementUnitId
      blockNumber
      date
    }
  `,
  SanctionSummaryFragment: `
    fragment SanctionSummaryFragment on SanctionSummaryReportData {
      id
      procurementUnitId
      totalKilometers
      areaName
      averageAgeWeightedObserved
      sanctionPercentageAmount
      sanctionReason
      sanctionPercentageRatio
      sanctionResultKilometers
      averageAgeRequired
    }
  `,
  SanctionListFragment: `
    fragment SanctionListFragment on SanctionListReportData {
      id
      procurementUnitId
      kilometers
      sanctionPercentageAmount
      sanctionFinancialAmount
      sanctionReason
      sanctionScope
      departureDate
      direction
      journeyStartTime
      reasonBenchmarkValue
      registryNr
      routeId
      sanctionReasonValue
    }
  `,
  DangerousDefectSanctionsFragment: `
    fragment DangerousDefectSanctionsFragment on DangerousDefectSanctionsReportData {
      id
      jolaId
      procurementUnitId
      name
      description
      observationDate
      priority
      registryNumber
      sanctionFinancialAmount
      appliedSanctionFinancialAmount
    }
  `,
  AdCoverSanctionsFragment: `
    fragment AdCoverSanctionsFragment on AdCoverSanctionsReportData {
      id
      jolaId
      procurementUnitId
      name
      description
      observationDate
      priority
      registryNumber
      sanctionFinancialAmount
      appliedSanctionFinancialAmount
    }
  `,
  DefectiveEquipmentDepartureSanctionsFragment: `
    fragment DefectiveEquipmentDepartureSanctionsFragment on DefectiveEquipmentDepartureSanctionsReportData {
      id
      jolaId
      procurementUnitId
      name
      description
      departureId
      startDate
      endDate
      priority
      registryNumber
      sanctionPercentageAmount
      appliedSanctionPercentage
      routeKilometers
      sanctionedKilometers
    }
  `,
}
