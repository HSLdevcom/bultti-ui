import React from 'react'
import { SanctionSummaryReportData } from '../schema-types'
import { getTotal } from '../util/getTotal'
import { round } from '../util/round'
import Big from 'big.js'

// Define column total functions here with the name of the report they apply to.
const reportTotalFns = {
  sanctionSummary: createSanctionSummaryColumnTotals,
}

// Return the applicable total function or undefined to signal that no totals should be shown.
export function createColumnTotalCallback(
  reportName: string,
  rows: unknown[]
): ((key: string) => React.ReactChild) | undefined {
  let reportTotalFn = reportTotalFns[reportName]

  if (!reportTotalFn) {
    return undefined
  }

  return reportTotalFn(rows)
}

// Column totals for the sanctionSummary report.
function createSanctionSummaryColumnTotals(rows: SanctionSummaryReportData[]) {
  return (key: keyof SanctionSummaryReportData) => {
    // Show the total kilometers sanctioned by this sanction.
    if (key.endsWith('KM')) {
      return round(getTotal(rows, key), 6) + ' KM'
    }

    // Show how many percentage of all sanctions this sanction column accounts for.
    if (key.endsWith('%')) {
      return Big(getTotal(rows, key)).div(Math.max(rows.length, 1)).round(6).mul(100) + '%'
    }

    return ''
  }
}
