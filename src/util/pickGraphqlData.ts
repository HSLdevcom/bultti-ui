import { get } from 'lodash'

export const pickGraphqlData = (data: any, pickKey = '') => {
  const dataKey = pickKey || Object.keys(data || {}).filter((key) => !key.startsWith('_'))[0]
  return get(data, dataKey, undefined)
}
