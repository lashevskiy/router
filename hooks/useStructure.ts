import { ReactNode, useEffect } from 'react'
import { ApplicationStructure, HistoryItemState } from '../shared/types'
import { useRouter, useLocation, useSafeContext, usePopout } from '.'
import * as Utils from '../utils'
import * as Contexts from '../contexts'

type Structure<S extends ApplicationStructure> = S & {
  modal: string | null
  popout: ReactNode
}

/**
 * Устанавливает структуру приложения и обновляет значения
 * в случае перехода на другое состояние навигации.
 */
export function useStructure<S extends ApplicationStructure, T>(
  initial: S,
  options: HistoryItemState<T> = {}
): Structure<S> {
  let location = useLocation() as S
  let navigator = useSafeContext(Contexts.Navigator)
  let router = useRouter()
  let popout = usePopout()

  useEffect(() => {
    let hash = window.location.hash.slice(1)

    router.replace(initial, options).then(() => {
      let serialized = navigator.convertSearchParams(hash)

      if (!hash || Utils.areObjectsEqual(serialized, initial)) {
        return
      }

      // Не включаем данные о структуре в параметры.
      // #panel=home&a=1&b=2 => { a: '1', b: '2' }
      let params = (({ modal, story, view, panel, ...o }) => o)(serialized)
      router.push(serialized, params)
    })
  }, [])

  return {
    modal: null,
    popout: popout.popout,
    ...(Utils.isObjectEmpty(location) ? initial : location),
  }
}
