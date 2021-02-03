import { observer } from 'mobx-react-lite'
import { languageState } from '../state/UIStore'
import { get } from 'lodash'

const languageFiles = {
  fi: require('../text/fi.json'),
}

export type Language = 'fi'

/**
 * @param {String} key - key in language files
 **/
function translate(key: string) {
  const language = languageState.language
  const languageFile = get(languageFiles, `${language}`, false)

  if (!languageFile) {
    console.error('No language file found for language: ' + language)
  }

  const languageStr = languageFile[key]

  if (!languageStr) {
    return key
  }

  return languageStr
}

/**
 * @param {String} key - key in language files
 * @param {Object} keyValueMap { key: value } - key is the same as ${key} in textCodeList, ${key} is replaced with value
 **/
export function text(key: string, keyValueMap?: Object) {
  let lineString = translate(key)
  const regexRule = /\$\{(\w+)\}/g // ${...}
  if (!keyValueMap) return lineString
  const replacer = (match: any, name: string) => {
    return name in keyValueMap ? keyValueMap[name] : match
  }
  lineString = lineString.replace(regexRule, replacer)
  return lineString
}

/**
 * @param {Object} props
 * @param {String} props.children - key in language files
 * @param {Object} props.keyValueMap { key: value } - key is the same as ${key} in textCodeList, ${key} is replaced with value
 **/
export const Text = observer(
  ({ children, keyValueMap }: { children?: string; keyValueMap?: Object }) => {
    if (!children) {
      return ''
    }
    return text(children, keyValueMap)
  }
)
