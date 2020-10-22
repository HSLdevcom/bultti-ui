import { action, extendObservable, observable } from 'mobx'
import { UIActions } from '../type/state'
import { Language } from '../util/translate'
import { Operator, Season } from '../schema-types'
import { operatorIsAuthorized } from '../util/operatorIsAuthorized'
import { setUrlValue } from '../util/urlValue'
import { uniqueId } from 'lodash'

// Language state is separate because some parts of the app that aren't
// in the scope of the React component tree may want to use it.
export const languageState: { language: Language } = observable({
  language: 'fi',
})

export const setLanguage = action((setTo: Language = 'fi') => {
  languageState.language = setTo
})

export const UIStore = (state): UIActions => {
  const defaultState = {
    unsavedFormIds: [],
    appLoaded: false,
    globalOperator: null,
    globalSeason: null,
    get language() {
      // proxy separate language state through app state
      return languageState.language
    },
    errorMessage: '',
  }

  extendObservable(state, defaultState)

  const setOperatorFilter = action((value: Operator | null) => {
    if (!operatorIsAuthorized(value, state.user)) {
      return
    }

    state.globalOperator = value
    setUrlValue('operator', !value || value.id === 0 ? null : value?.operatorId + '' || '')
  })

  const setSeasonFilter = action((value: Season | string | null) => {
    state.globalSeason = value
    setUrlValue('season', typeof value === 'string' ? value : value?.id || '')
  })

  const setErrorMessage = action((message: string) => {
    state.errorMessage = message
  })

  const onAppLoaded = action(() => {
    state.appLoaded = true
  })

  const setFormUnsaved = action((unsavedFormId: string, isUnsaved = true) => {
    let useFormId =
      (unsavedFormId && isUnsaved) || !isUnsaved
        ? unsavedFormId
        : !unsavedFormId && isUnsaved
        ? uniqueId()
        : ''

    let isCurrentlyUnsaved = state.unsavedFormIds.includes(useFormId)

    if (isUnsaved && !isCurrentlyUnsaved) {
      state.unsavedFormIds = [...state.unsavedFormIds, useFormId]
      return useFormId
    }

    if (!isUnsaved && isCurrentlyUnsaved) {
      state.unsavedFormIds = [...state.unsavedFormIds].filter((id) => id !== useFormId)
    }

    return ''
  })

  return {
    globalOperator: setOperatorFilter,
    globalSeason: setSeasonFilter,
    appLoaded: onAppLoaded,
    language: setLanguage,
    errorMessage: setErrorMessage,
    unsavedFormIds: setFormUnsaved,
  }
}
