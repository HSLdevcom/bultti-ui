import { SanctionSummaryReportData } from '../schema-types'
import { text } from '../util/translate'

const reportTransformsMap = {
  sanctionSummary: sanctionSummaryTransform,
}

export function transformReport(reportName: string, reportRows: unknown[]) {
  let transformFn = reportTransformsMap[reportName] || ((rows) => rows)
  return transformFn(reportRows)
}

export function hasReportTransform(reportName: string) {
  return !!reportTransformsMap[reportName]
}

type SanctionSummaryReportItemConstants = {
  procurementUnitId: string
  totalKilometers: number
  areaName: string
  averageAgeWeightedObserved: number
  averageAgeRequired: number
}

type SanctionSummaryReportItem = SanctionSummaryReportItemConstants & Record<string, number>

function getSanctionColumns(
  sanctionAmount,
  sanctionReason,
  values: { sanctionPercentageAmount: number; sanctionResultKilometers: number } = {
    sanctionResultKilometers: 0,
    sanctionPercentageAmount: 0,
  }
) {
  let cols = {}
  let reasonText = text('postInspection_sanctionReason_' + sanctionReason)
  let sanctionAmountCol = `${reasonText} ${sanctionAmount}%`
  let sanctionAmountKmCol = `${reasonText} S${sanctionAmount} (km)`

  cols[sanctionAmountCol] = values.sanctionPercentageAmount
  cols[sanctionAmountKmCol] = values.sanctionResultKilometers

  return cols
}

function sanctionSummaryTransform(
  rows: SanctionSummaryReportData[]
): SanctionSummaryReportItem[] {
  let resultRows = new Map<string, SanctionSummaryReportItem>()

  // Template for dynamic keyed sanction summary items
  let sanctionAmountColumnsTemplate = rows.reduce(
    (cols: Record<string, number>, { sanctionPercentageAmount, sanctionReason }) => {
      let sanctionCols = getSanctionColumns(sanctionPercentageAmount, sanctionReason)
      return { ...cols, ...sanctionCols }
    },
    {}
  )

  for (let row of rows) {
    let {
      sanctionPercentageAmount,
      sanctionReason,
      sanctionPercentageRatio,
      sanctionResultKilometers,
      procurementUnitId,
    } = row

    let resultRow: SanctionSummaryReportItemConstants | undefined =
      resultRows.get(procurementUnitId)
    if (!resultRow) {
      resultRow = {
        procurementUnitId: row.procurementUnitId,
        totalKilometers: row.totalKilometers,
        areaName: row.areaName,
        averageAgeWeightedObserved: row.averageAgeWeightedObserved,
        averageAgeRequired: row.averageAgeRequired,
        ...sanctionAmountColumnsTemplate,
      }
    } else {
      resultRow.totalKilometers = row.totalKilometers
      resultRow.averageAgeRequired = row.averageAgeRequired
    }

    let sanctionCols = getSanctionColumns(sanctionPercentageAmount, sanctionReason, {
      sanctionResultKilometers,
      sanctionPercentageAmount,
    })

    let fullResultRow = {
      ...resultRow,
      ...sanctionCols,
    } as SanctionSummaryReportItem

    resultRows.set(procurementUnitId, fullResultRow)
  }

  return Array.from(resultRows.values())
}
