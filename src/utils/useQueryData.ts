import { useQuery } from '@apollo/react-hooks'
import { DocumentNode } from 'graphql'
import { pickGraphqlData } from './pickGraphqlData'
import { OperationVariables } from '@apollo/react-common'
import { QueryHookOptions } from '@apollo/react-hooks/lib/types'
import { useMemo } from 'react'

export const useQueryData = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options: QueryHookOptions<TData, TVariables> = {},
  pickData = ''
) => {
  const { loading, error, data, refetch } = useQuery<TData, TVariables>(query, options)
  const pickedData = useMemo(() => pickGraphqlData(data, pickData), [data, pickData])
  return { data: pickedData, loading, error, refetch }
}
