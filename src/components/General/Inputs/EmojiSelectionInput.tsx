import React, { Fragment, SelectHTMLAttributes, forwardRef, useState } from 'react'

import { CaretDown } from 'phosphor-react'

import { Listbox, Transition } from '@headlessui/react'

type Props = {
  options: { value: string; label: string; emoji?: string }[]
  defaultValue?: string
  className?: string
  onSelect?: (value: string) => void
}

const EmojiOptionsInput = forwardRef<SelectHTMLAttributes<HTMLSelectElement>, Props>(
  ({ onSelect, className, options, defaultValue, ...props }, ref) => {
    const [activeItem, setActiveItem] = useState<(typeof options)[0]>(options?.filter(v => v.value === defaultValue )?.[0] || options[0])

    return (
      <>
        <Listbox
          value={activeItem?.value || ''}
          onChange={(d) => {
            setActiveItem(options[options.findIndex((o) => o.value === d)] || options[0])
            onSelect?.(options[options.findIndex((o) => o.value === d)].value || options[0].value)
          }}
        >
          <div className='relative my-1.5 flex w-full items-center justify-start'>
            <Listbox.Button className={'relative flex w-full flex-row items-center justify-between rounded-md border border-tertiary bg-secondary px-3 py-2.5 text-lg text-white placeholder-shown:text-subtle active:text-white ' + className}>
              <p className='flex flex-row'>
                <span className='mr-4 font-noto'>{activeItem?.emoji || '📌'}</span>
                {activeItem?.label}
              </p>
              <CaretDown className='ml-4 text-subtle' size={24} />
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Listbox.Options className='absolute z-10 w-full py-1 overflow-auto show-scroll text-base translate-y-1/2 rounded-md shadow-lg mt-14 bg-tertiary ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-[30vh]'>
                {options.map((option, optionIdx) => (
                  <Listbox.Option
                    key={optionIdx}
                    className={({ active }) =>
                      `relative mx-1 cursor-pointer select-none rounded-md py-3 pl-4 pr-4 text-lg duration-200 ${
                        active
                          ? 'bg-accent text-primary'
                          : 'text-white text-opacity-60' + activeItem.value === option.value
                          ? ' bg-accent'
                          : ''
                      } ${className}`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          <span className='mr-4 font-noto'>{option.emoji || '📌'}</span> 
                          {option.label}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </>
    )
    // return <div className='flex items-center justify-start w-full relative my-1.5'>
    //   <select
    //     className='w-full rounded-md bg-secondary text-lg pl-12 px-3 py-2.5 border border-tertiary active:text-white placeholder-shown:text-subtle text-white'
    //     placeholder={placeholder.label}
    //     onChange={e => setSelectedOption(options.find(option => option.value === e.target.value))}
    //   >
    //     {options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
    //   </select>
    //   <div className='absolute text-xl -translate-y-1/2 left-3 top-1/2'>
    //     {selectedOption ? selectedOption.emoji : placeholder.emoji}
    //   </div>
    // </div>
  }
)
EmojiOptionsInput.displayName = 'EmojiOptionsInput'

export default EmojiOptionsInput
