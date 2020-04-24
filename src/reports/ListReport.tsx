import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Table from '../common/components/Table'
import { ReportComponentProps } from './reportUtil'

const ListReportView = styled.div``

export type PropTypes<T = any> = ReportComponentProps<T>

const ListReport = observer(<ItemType extends any>({ items }: PropTypes<ItemType>) => {
  return (
    <ListReportView>
      <Table<ItemType> items={items} />
    </ListReportView>
  )
})

export default ListReport