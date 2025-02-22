import clsx from 'clsx'
import { useAtom } from 'jotai'

import { userPreferedPlayerMode } from '@/stores/atoms'


type Props = {
  children: React.ReactNode | React.ReactNode[] | JSX.Element | JSX.Element[]
  fluid?: boolean
}

function Media({ children, fluid }: Props) {
  const [playerMode] = useAtom(userPreferedPlayerMode)
  
  const playerModeClasses = clsx({
    'flex bg-primary w-screen h-[calc(100vh-40px)] overflow-y-scroll max-h-[100vh] rounded-b-lg select-none overflow-y-auto overflow-x-hidden bg-primary transition-all duration-200': true,
    '!p-0 !mt-10': fluid,
    '!mt-0 h-screen': playerMode === 'expanded',
    'mt-10 pt-10': playerMode === 'normal',
  })
  
  return (
    <main className={playerModeClasses} id='content'>
      {children}
    </main>
  )
}

export default Media
