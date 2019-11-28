import React, { useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Colors } from '../utils/HSLColors'
import { LoadingDisplay } from '../components/Loading'
import HSLLogoNoText from '../icons/HSLLogoNoText'
import Login from '../icons/Login'
import { authorize, redirectToLogin } from '../utils/authentication'
import { useStateValue } from '../state/useAppState'
import { LoginButton } from '../components/common'
import { ALLOW_DEV_LOGIN } from '../constants'

const LoadingScreen = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: ${Colors.primary.hslBlue};
`

const ButtonWrapper = styled.div`
  margin-bottom: 2rem;
`

const LoadingIndicator = styled(LoadingDisplay)`
  position: static;
`

const Header = styled.div`
  margin-bottom: 2.5rem;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Title = styled.h2`
  color: white;
  font-size: 5rem;
  margin: 1rem 0 0;
  text-align: center;
`

type PropTypes = {
  children?: React.ReactNode
  unauthenticated: boolean
}

const AuthGate: React.FC<PropTypes> = observer(({ unauthenticated = false }) => {
  const [loading, setLoading] = useState(false)
  const [, setUser] = useStateValue('user')

  const openAuthForm = useCallback(() => {
    redirectToLogin()
  }, [])

  const onDevLogin = useCallback(async () => {
    setLoading(true)

    const response = await authorize('dev')

    if (response && response.isOk && response.email) {
      setUser({ email: response.email })
    }

    setLoading(false)
  }, [])

  return (
    <LoadingScreen>
      <Header>
        {!loading ? (
          <HSLLogoNoText fill="white" height={80} />
        ) : (
          <LoadingIndicator loading={true} size={80} />
        )}
        <Title>HSL Bultti</Title>
      </Header>
      {unauthenticated && (
        <>
          <ButtonWrapper>
            <LoginButton onClick={openAuthForm}>
              <Login height={'1em'} fill={'#3e3e3e'} />
              <span className="buttonText">Kirjaudu sisään</span>
            </LoginButton>
          </ButtonWrapper>
          {ALLOW_DEV_LOGIN && (
            <ButtonWrapper>
              <LoginButton onClick={onDevLogin}>
                <Login height={'1em'} fill={'#3e3e3e'} />
                <span className="buttonText">Dev login</span>
              </LoginButton>
            </ButtonWrapper>
          )}
        </>
      )}
    </LoadingScreen>
  )
})

export default AuthGate