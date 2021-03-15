import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useStateValue } from '../../state/useAppState'
import SelectOperator from '../input/SelectOperator'
import { UserRole } from '../../schema-types'
import { getUrlValue } from '../../util/urlValue'
import { SidebarStyledSelect } from './AppSidebar'
import { useLocation } from '@reach/router'

const GlobalOperatorFilter: React.FC = observer(() => {
  var [operator, setOperatorFilter] = useStateValue('globalOperator')
  var [user] = useStateValue('user')
  var location = useLocation()

  let initialOperatorId = useMemo(() => {
    let initialVal = getUrlValue('operator')
    return initialVal ? parseInt(initialVal as string, 10) : undefined
  }, [user, location.search])

  var userIsOperator = user && user?.role === UserRole.Operator

  return (
    <SidebarStyledSelect
      as={SelectOperator}
      onSelect={setOperatorFilter}
      value={operator}
      label={userIsOperator ? 'Liikennöitsijä' : 'Valitse liikennöitsijä'}
      selectInitialId={initialOperatorId}
    />
  )
})

export default GlobalOperatorFilter
