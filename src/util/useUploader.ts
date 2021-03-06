import {
  ApolloError,
  MutationFunctionOptions,
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client'
import { DocumentNode } from 'graphql'
import { useCallback, useMemo, useState } from 'react'
import { pickGraphqlData } from './pickGraphqlData'
import { GraphQLError } from 'graphql/error/GraphQLError'
import { MutationFnType } from './useMutationData'

export type Uploader<TData = unknown, TVariables = OperationVariables> = [
  (
    file: File | null,
    overrideOptions?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<{ data: TData | null; error?: GraphQLError }>,
  {
    data: null | TData
    loading: boolean
    uploadError?: ApolloError
    called: boolean
    mutationFn: MutationFnType<TData, TVariables>
  }
]

export const useUploader = <TData = unknown, TVariables = OperationVariables>(
  mutation: DocumentNode,
  options: MutationHookOptions<TData, TVariables> = {},
  onUploadFinished?: (data?: TData, errors?: ReadonlyArray<GraphQLError>) => void
): Uploader<TData, TVariables> => {
  let [uploadError, setUploadError] = useState()
  let [uploadLoading, setUploadLoading] = useState(false)

  let errorHandler = useCallback((err) => {
    setUploadError(err)
    return { data: null, error: err }
  }, [])

  // To catch mutationFnError, use .catch() where mutationFn is called.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mutationFn, { data, called }] = useMutation<TData, TVariables>(mutation, {
    notifyOnNetworkStatusChange: true,
    ...options,
  })

  const uploadFile = useCallback(
    (file: File | null, overrideOptions = {}) => {
      let { variables: overrideVariables = {}, ...restOptions } = overrideOptions

      const queryOptions: MutationFunctionOptions<TData, TVariables> = {
        ...restOptions,
        variables: {
          ...(options?.variables || {}),
          ...overrideVariables,
          file,
        },
      }

      setUploadError(undefined)
      setUploadLoading(true)

      return mutationFn(queryOptions)
        .then((result) => {
          const uploadedData = pickGraphqlData(result.data)

          if (onUploadFinished) {
            onUploadFinished(uploadedData, result.errors)
          }

          return { data: uploadedData, error: (result?.errors || [])[0] }
        })
        .catch(errorHandler)
        .finally(() => {
          setUploadLoading(false)
        })
    },
    [options?.variables, errorHandler, mutationFn, onUploadFinished]
  )

  const pickedData = useMemo(() => pickGraphqlData(data), [data])

  return [
    uploadFile,
    {
      data: pickedData,
      loading: uploadLoading,
      uploadError,
      called,
      mutationFn,
    },
  ]
}
