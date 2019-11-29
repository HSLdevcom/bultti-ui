import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Text } from '../utils/translate'
import { HSLLogoNoText } from '../icons/HSLLogoNoText'
import { Link } from '@reach/router'
import { Search } from '../icons/Search'
import { Plus } from '../icons/Plus'
import { Menu } from '../icons/Menu'
import { Button } from './Button'
import { logout } from '../utils/authentication'
import { observer } from 'mobx-react-lite'
import { useStateValue } from '../state/useAppState'
import { User } from '../icons/User'

const AppSidebarView = styled.div`
  overflow: hidden;
`

const HSLLogo = styled(HSLLogoNoText)`
  margin-right: 1rem;
  display: block;
`

const AppTitle = styled.h1`
  padding: 2rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const AppNav = styled.nav`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`

const NavLink = styled(Link)`
  padding: 1.25rem 1rem 1.25rem 1rem;
  color: white;
  text-decoration: none;
  transition: background 0.1s ease-out, transform 0.1s ease-out;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  &:hover {
    background: rgba(0, 0, 0, 0.15);
    transform: scale(1.025);
  }

  svg {
    display: block;
    margin-right: 0.75rem;
  }
`

const NavCategory = styled.div`
  margin-bottom: 2rem;
`

const CategoryTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #eeeeee;
  margin: 0;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  border-bottom: 1px solid var(--dark-blue);
`

const UserBar = styled.div`
  background: rgba(0, 0, 0, 0.15);
  padding: 0.75rem 1rem;
`

const UserBarRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
`

const UserDisplay = styled.div`
  font-weight: bold;
  margin-left: 1rem;
`

/*const LangButton = styled(Button).attrs({
  small: true,
  transparent: true,
})<{ selected: boolean }>`
  background: ${(p) => (p.selected ? 'white' : 'transparent')};
  color: ${(p) => (p.selected ? 'var(--dark-blue)' : 'white')};
  padding: 0 0.55rem;
  text-transform: uppercase;
  border-radius: 5px;
  font-size: 0.875rem;
  font-weight: bold;

  &:hover {
    color: white;
  }
`*/

export type AppSidebarProps = {
  children?: React.ReactNode
}

const AppSidebar: React.FC<AppSidebarProps> = observer(() => {
  const [user, setUser] = useStateValue('user')
  const [logoutLoading, setLogoutLoading] = useState(false)

  const onLogout = useCallback(async () => {
    setLogoutLoading(true)
    const result = await logout()

    if (result) {
      setUser(null)
    }

    setLogoutLoading(false)
  }, [])

  return (
    <AppSidebarView>
      <AppTitle>
        <HSLLogo fill="white" height={40} />
        <Text>general.app.companyName</Text> <Text>general.app.title</Text>
      </AppTitle>
      <UserBar>
        <UserBarRow>
          <User width="1rem" height="1rem" fill="white" />
          {user && <UserDisplay>{user?.email}</UserDisplay>}
        </UserBarRow>
        <Button loading={logoutLoading} onClick={onLogout} small transparent>
          <Text>general.app.logout</Text>
        </Button>
      </UserBar>
      <AppNav>
        <NavCategory>
          <CategoryTitle>
            <Text>nav.category.preinspection</Text>
          </CategoryTitle>
          <NavLink to="preinspection">
            <Search fill="white" width="1rem" height="1rem" />
            <Text>nav.list.preinspections</Text>
          </NavLink>
          <NavLink to="preinspection">
            <Plus fill="white" width="1rem" height="1rem" />
            <Text>nav.new.preinspection</Text>
          </NavLink>
          <NavLink to="preinspection/reprots">
            <Menu fill="white" width="1rem" height="1rem" />
            <Text>nav.reports</Text>
          </NavLink>
        </NavCategory>
        <NavCategory>
          <CategoryTitle>
            <Text>nav.category.postinspection</Text>
          </CategoryTitle>
          <NavLink to="postinspection">
            <Search fill="white" width="1rem" height="1rem" />
            <Text>nav.list.postinspections</Text>
          </NavLink>
        </NavCategory>
      </AppNav>
    </AppSidebarView>
  )
})

export default AppSidebar