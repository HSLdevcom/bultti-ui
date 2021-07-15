import { TableRowWithDataAndFunctions } from '../common/table/tableUtils'
import { SanctionSummaryReportData } from '../schema-types'

export const reportCellHighlightColorMap = {
  sanctionSummary: getSanctionSummaryReportCellHighlightColor,
}

function getSanctionSummaryReportCellHighlightColor(
  rowItem: TableRowWithDataAndFunctions<SanctionSummaryReportData>,
  key: string
): string {
  return key === 'averageAgeWeightedObserved' &&
    rowItem.item.averageAgeWeightedObserved > rowItem.item.averageAgeRequired
    ? 'var(--yellow)'
    : ''
}
