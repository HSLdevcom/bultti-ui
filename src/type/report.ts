import { FilterConfig, InspectionType, SortConfig } from '../schema-types'
import { IFilteredSortedResponse } from '../common/table/tableUtils'

export interface BaseReport<DataType extends {}> extends IFilteredSortedResponse<DataType> {
  name: string
  title: string
  description: string
  inspectionType: InspectionType
  columnLabels: string
  rows: any[]
  filteredCount: number
  totalCount: number
  pages: number
  seasonId: string
  operatorId: number
  inspectionId: string
  filters?: FilterConfig[]
  sort?: SortConfig[]
  showSanctioned?: boolean
  showUnsanctioned?: boolean
}
