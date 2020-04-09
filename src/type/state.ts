import { FunctionMap } from './common'
import { Language } from '../util/translate'
import { Operator, Season, User } from '../schema-types'

export interface IAppState {
  user?: User
  globalOperator?: Operator | null
  globalSeason?: Season | string | null
  language?: Language
}

export type Initializer<T = any> = (state: IAppState, initialData: IAppState) => T | Promise<T>

export interface UserActions extends FunctionMap {
  user: (User) => void
}

export interface UIActions extends FunctionMap {
  globalOperator: (operator: Operator | null) => void
  globalSeason: (season: Season | string | null) => void
  appLoaded: () => void
  language: (setTo: Language) => void
}

export type ActionMap = UserActions & UIActions

export type StoreContext = {
  state: IAppState
  actions: ActionMap
}
