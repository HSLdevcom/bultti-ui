import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useQueryData } from '../util/useQueryData'
import { createReportQueryByName } from './reportQueries'
import { InspectionType } from '../schema-types'
import { defaultPageConfig, useTableState } from '../common/table/useTableState'
import ReportView from './ReportView'
import DownloadReport from './DownloadReport'
import { Button, ButtonSize, ButtonStyle } from '../common/components/Button'
import { Text } from '../util/translate'
import { FlexRow } from '../common/components/common'
import { BaseReport } from '../type/report'
import { createPageState, PageState } from '../common/table/tableUtils'

const ReportFunctionsRow = styled(FlexRow)`
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid var(--lighter-grey);
  margin: -0.25rem -1rem 0;
`

export type PropTypes = {
  reportName: string
  inspectionType: InspectionType
  inspectionId: string
}

const ReportContainer = observer(({ reportName, inspectionId, inspectionType }: PropTypes) => {
  let tableState = useTableState()
  let { filters = [], sort = [], page = defaultPageConfig } = tableState

  let requestVars = useRef({
    reportName,
    inspectionId,
    inspectionType,
    filters,
    sort,
    page,
  })

  let { data: report, loading: reportLoading, refetch } = useQueryData<BaseReport>(
    createReportQueryByName(reportName),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: { ...requestVars.current },
    }
  )

  let onUpdateFetchProps = useCallback(() => {
    requestVars.current.filters = filters
    refetch({ ...requestVars.current, sort, page })
  }, [refetch, requestVars.current, filters, sort, page])

  // Trigger the refetch when sort or page state changes. Does NOT react to
  // filter state, which is triggered separately with a button.
  useEffect(() => {
    onUpdateFetchProps()
  }, [sort, page])

  let reportDataItems = useMemo(() => report?.reportData || [], [report])

  let isExecutionRequirementReport = reportDataItems.some((dataItem) =>
    ['ObservedExecutionRequirementsReportData', 'ExecutionRequirementsReportData'].includes(
      dataItem.__typename
    )
  )

  let columnLabels = useMemo(() => {
    return report?.columnLabels ? JSON.parse(report?.columnLabels) : undefined
  }, [report])

  // TODO: Make BaseReport conform to FilteredPagedSortedResponse
  let reportPageState: PageState = useMemo(() => {
    let { reportData, filteredCount, totalCount, pages, page, filters, sort } = report

    return createPageState<BaseReport>({
      rows: reportData,
      page,
      filters,
      sort,
      filteredCount,
      totalCount,
      pages,
    })
  }, [report])

  return (
    <>
      <ReportFunctionsRow>
        {inspectionType && inspectionId && (
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
          onClick={onUpdateFetchProps}>
          <Text>update</Text>
        </Button>
      </ReportFunctionsRow>
      <ReportView
        reportType={
          isExecutionRequirementReport
            ? inspectionType === InspectionType.Post
              ? 'observedExecutionRequirement'
              : 'executionRequirement'
            : 'list'
        }
        loading={reportLoading}
        items={reportDataItems}
        tableState={tableState}
        pageState={reportPageState}
        onUpdate={onUpdateFetchProps}
        columnLabels={columnLabels}
      />
    </>
  )
})

export default ReportContainer
