import { gql } from '@apollo/client'
import { reportQueryFragments } from './reportQueryFragments'

export const reportsQuery = gql`
  query inspectionReports($inspectionType: String!, $inspectionId: String) {
    reports(inspectionType: $inspectionType, inspectionId: $inspectionId) {
      name
      title
      description
    }
  }
`

export const createReportQueryByName = (reportName: string) => {
  // Uppercase the first letter and add Fragment to the end to get the fragment name of the report.
  let dataFragmentName = `${
    reportName[0].toUpperCase() + reportName.substring(1)
  }Fragment` as keyof typeof reportQueryFragments

  let dataFragment = reportQueryFragments[dataFragmentName]

  let queryStr = `
    query ${reportName}Report(
      $inspectionId: String!
      $filters: [InputFilterConfig!]
      $sort: [InputSortConfig!]
    ) {
      ${reportName}Report(
        inspectionId: $inspectionId
        filters: $filters
        sort: $sort
      ) {
        id
        description
        name
        title
        columnLabels
        totalCount
        filteredCount
        operatorId
        seasonId
        showSanctioned
        showUnsanctioned
        groupRowsBy
        filters {
          field
          filterValue
        }
        sort {
          column
          order
        }
        rows {
        ...${dataFragmentName}
        }
      }
    }
    ${dataFragment}
  `

  return gql(queryStr)
}
