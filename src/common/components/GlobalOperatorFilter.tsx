import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useStateValue } from '../../state/useAppState'
import SelectOperator from '../input/SelectOperator'
import { UserRole } from '../../schema-types'
import { getUrlValue } from '../../util/urlValue'
import { SidebarStyledSelect } from './AppSidebar'

const GlobalOperatorFilter: React.FC = observer(() => {
  var [operator, setOperatorFilter] = useStateValue('globalOperator')
  var [user] = useStateValue('user')

  var initialOperatorId = useMemo(() => {
    let initialVal = getUrlValue('operator')
    return initialVal ? parseInt(initialVal as string, 10) : undefined
  }, [])

  var userIsOperator = user && user?.role === UserRole.OperatorUser

  return (
    <SidebarStyledSelect
      as={SelectOperator}
      allowAll={false}
      onSelect={setOperatorFilter}
      value={operator}
      label={userIsOperator ? 'Liikennöitsijä' : 'Valitse liikennöitsijä'}
      theme="dark"
      selectInitialId={initialOperatorId}
    />
  )
})

export default GlobalOperatorFilter
