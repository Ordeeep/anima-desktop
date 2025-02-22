import React from 'react'

import Link from 'next/link'
import { ArrowLeft } from 'phosphor-react'

type Props = {
  target: string
  onClick?: () => void
}

function BackButton({ target, onClick }: Props) {
  return (
    <Link href={target} onClick={onClick}>
      <div className="flex items-center justify-center w-12 h-12 text-white rounded-md cursor-pointer pointer-events-auto text-opacity:80 hover:bg-black hover:text-accent hover:text-opacity-100">
        <svg  viewBox="0 0 32 32" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className='w-6 h-6'>
          <path d="M13.0908 14.3334C12.972 14.3334 12.9125 14.1898 12.9965 14.1058L17.7021 9.40022C17.9625 9.13987 17.9625 8.71776 17.7021 8.45741L16.2879 7.04319C16.0275 6.78284 15.6054 6.78284 15.3451 7.04319L6.8598 15.5285C6.59945 15.7888 6.59945 16.2109 6.8598 16.4713L8.27401 17.8855L8.27536 17.8868L15.3453 24.9568C15.6057 25.2172 16.0278 25.2172 16.2881 24.9568L17.7024 23.5426C17.9627 23.2822 17.9627 22.8601 17.7024 22.5998L12.9969 17.8944C12.9129 17.8104 12.9724 17.6668 13.0912 17.6668L26 17.6668C26.3682 17.6668 26.6667 17.3683 26.6667 17.0001V15.0001C26.6667 14.6319 26.3682 14.3334 26 14.3334L13.0908 14.3334Z" fill="currentColor" />
        </svg>
      </div>
    </Link>
  )
}

export default BackButton
