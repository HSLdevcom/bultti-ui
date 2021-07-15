import React, { useMemo } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useQueryData } from '../util/useQueryData'
import { createReportQueryByName } from './reportQueries'
import { InspectionStatus, InspectionType } from '../schema-types'
import { createResponseId, useTableState } from '../common/table/useTableState'
import DownloadReport from './DownloadReport'
import { Button, ButtonSize, ButtonStyle } from '../common/components/buttons/Button'
import { text, Text } from '../util/translate'
import { FlexRow } from '../common/components/common'
import { ReportTypeByName } from './reportTypes'
import { LoadingDisplay } from '../common/components/Loading'
import ExecutionRequirementsReport from './ExecutionRequirementsReport'
import ObservedExecutionRequirementsReport from './ObservedExecutionRequirementsReport'
import FilteredResponseTable from '../common/table/FilteredResponseTable'
import { hasReportTransform, transformReport } from './transformReports'
import { createColumnTotalCallback } from './reportTotals'
import { reportCellHighlightColorMap } from './reportCellHighlightColor'
import { BaseReport } from '../type/report'

const ReportViewWrapper = styled.div`
  position: relative;
  min-height: 10rem;
`

const ReportFunctionsRow = styled(FlexRow)`
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid var(--lighter-grey);
  margin: -0.25rem -1rem 0;
`

export type PropTypes = {
  reportName: keyof ReportTypeByName
  inspectionType: InspectionType
  inspectionId: string
  inspectionStatus: InspectionStatus
}

interface ReportItemKeyInterface {
  id?: string
  _id?: string
  departureId?: string
  registryNr?: string
}

let reportKeyFromItem = (item: ReportItemKeyInterface): string =>
  item?.id || item?._id || item?.departureId || item?.registryNr || ''

const ReportContainer = observer((props: PropTypes) => {
  let { reportName, inspectionId, inspectionType, inspectionStatus } = props
  let tableState = useTableState()
  let { filters = [], sort = [] } = tableState

  type ReportDataType = ReportTypeByName[typeof reportName]

  let {
    data: report,
    loading: reportLoading,
    refetch,
  } = useQueryData<BaseReport<ReportDataType>>(createReportQueryByName(reportName), {
    notifyOnNetworkStatusChange: true,
    variables: {
      // Add a string variable that changes when the table state changes.
      // Without this it wouldn't refetch if eg. filters change.
      responseId: createResponseId({ filters, sort }),
      reportName,
      inspectionId,
      inspectionType,
      filters,
      sort,
    },
  })

  // Prepare report data by transforming report rows (if necessary) and parsing the column labels.
  let preparedReport = useMemo(() => {
    if (!report) {
      return report
    }

    // Transform data. Will be passed through untouched if no transform is implemented.
    let transformedRows = transformReport(reportName, report.rows)
    let columnLabels = report?.columnLabels ? JSON.parse(report?.columnLabels) : undefined

    let rowModel = transformedRows[0]

    // Column labels from the response are already OK if rows were not transformed.
    if (!rowModel || !columnLabels || !hasReportTransform(reportName)) {
      return { ...report, columnLabels, rows: transformedRows }
    }

    let totalRowsCount = transformedRows.length

    // Add the transformed row keys to the column labels in order to actually show them.
    for (let colName of Object.keys(rowModel)) {
      // Skip id col
      if (colName === 'id') {
        continue
      }

      if (!columnLabels[colName]) {
        columnLabels[colName] = colName
      }
    }

    // Return amended report object with transformed rows and column labels.
    return {
      ...report,
      totalCount: totalRowsCount,
      filteredCount: totalRowsCount,
      rows: transformedRows,
      columnLabels,
    }
  }, [report, reportName])

  let columnLabels = preparedReport?.columnLabels
  let reportDataItems = preparedReport?.rows || []

  // Determine if the report is about some form of execution requirement.
  // These have their own report components.
  let isExecutionRequirementReport = reportDataItems.some((dataItem) =>
    ['ObservedExecutionRequirementsReportData', 'ExecutionRequirementsReportData'].includes(
      dataItem.__typename
    )
  )

  let reportType = isExecutionRequirementReport
    ? inspectionType === InspectionType.Post
      ? 'observedExecutionRequirement'
      : 'executionRequirement'
    : 'list'

  let calculateReportTotals = useMemo(
    () => createColumnTotalCallback(reportName, preparedReport?.rows || []),
    [reportName, preparedReport]
  )

  let getCellHighlightColor = reportCellHighlightColorMap[reportName]

  return (
    <ReportViewWrapper>
      <ReportFunctionsRow>
        {inspectionStatus === InspectionStatus.InProduction &&
          inspectionType &&
          inspectionId && (
            <DownloadReport
              reportName={reportName}
              inspectionId={inspectionId}
              inspectionType={inspectionType}
            />
          )}
        <Button
          style={{ marginLeft: 'auto' }}
          buttonStyle={ButtonStyle.SECONDARY}
          size={ButtonSize.SMALL}
          onClick={() => refetch()}>
          <Text>update</Text>
        </Button>
      </ReportFunctionsRow>
      <LoadingDisplay loading={reportLoading} />
      {reportType === 'executionRequirement' ? (
        <ExecutionRequirementsReport items={reportDataItems} />
      ) : reportType === 'observedExecutionRequirement' ? (
        <ObservedExecutionRequirementsReport items={reportDataItems} />
      ) : (
        preparedReport && (
          <FilteredResponseTable
            data={preparedReport}
            tableState={tableState}
            columnLabels={columnLabels}
            keyFromItem={reportKeyFromItem}
            getColumnTotal={calculateReportTotals}
            getCellHighlightColor={getCellHighlightColor}
            groupBy={
              report?.groupRowsBy
                ? (item) =>
                    report?.groupRowsBy ? text(item[report.groupRowsBy] as string) : 'default'
                : undefined
            }
          />
        )
      )}
    </ReportViewWrapper>
  )
})

export default ReportContainer
