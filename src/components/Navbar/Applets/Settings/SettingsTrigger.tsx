import { useTranslation } from 'react-i18next'

import i18next from 'i18next'
import { useAtom } from 'jotai'
import { ChatCenteredDots, Gauge, GearSix } from 'phosphor-react'

import EmojiOptionsInput from '@/components/General/Inputs/EmojiSelectionInput'
import NavIcon from '@/components/Navbar/NavbarIcon'
import { userPreferedAudio, userPreferedAutoNextEpisode, userPreferedAutoplay, userPreferedPlaybackQuality, userPreferedSubtitles } from '@/stores/atoms'
import * as Dialog from '@radix-ui/react-dialog'
import { PlayIcon, FullscreenArrowIcon, SubtitlesIcon, VolumeHighIcon, NextIcon, LanguageIcon } from '@vidstack/react'

function NavSettings() {
  const { t } = useTranslation()
  const autoplayAtom = useAtom(userPreferedAutoplay)
  const subtitlesAtom = useAtom(userPreferedSubtitles)
  const audioAtom = useAtom(userPreferedAudio)
  const autoNextAtom = useAtom(userPreferedAutoNextEpisode)
  const qualityAtom = useAtom(userPreferedPlaybackQuality)
  
 
  const userOptions = [
    {
      label: t('user.edit.preferedAutoplay'),
      icon: <PlayIcon size={24} />,
      atom: autoplayAtom,
      type: 'boolean'
    },
    {
      label: t('user.edit.preferedSubtitles'),
      icon: <SubtitlesIcon size={24} />,
      atom: subtitlesAtom,
      type: 'options',
      options: [
        { label: 'pt-BR', value: 'pt-BR', emoji: '🇧🇷' },
        { label: 'en-US', value: 'en-US', emoji: '🇺🇸' },
        { label: 'es-ES', value: 'es-ES', emoji: '🇪🇸' },
        { label: 'ja-JP', value: 'ja-JP', emoji: '🇯🇵' },
        { label: 'None', value: 'Disabled', emoji: '🤓' }
      ]
    },
    {
      label: t('user.edit.preferedQuality'),
      icon: <FullscreenArrowIcon size={24}  />,
      atom: qualityAtom,
      type: 'options',
      options: [
        { label: '1080p', value: '1080p', emoji: '📺' },
        { label: '720p', value: '720p', emoji: '📺' },
        { label: '480p', value: '480p', emoji: '📺' },
        { label: '360p', value: '360p', emoji: '❓' },
        { label: '240p', value: '240p', emoji: '❗' },
        { label: '144p', value: '144p', emoji: '🗑️' },
      ]
    },
    {
      label: t('user.edit.preferedAudio'),
      icon: <VolumeHighIcon size={24} />,
      atom: audioAtom,
      type: 'options',
      options: [
        { label: 'pt-BR', value: 'pt-BR', emoji: '🇧🇷' },
        { label: 'en-US', value: 'en-US', emoji: '🇺🇸' },
        { label: 'es-ES', value: 'es-ES', emoji: '🇪🇸' },
        { label: 'ja-JP', value: 'ja-JP', emoji: '🇯🇵' }
      ]
    },
    {
      label: t('user.edit.preferedAutoNextEpisode'),
      icon: <NextIcon size={24} />,
      atom: autoNextAtom,
      type: 'boolean'
    }
  ]


  // TODO: Fetch notifications
  return (
    <Dialog.Root>
    <Dialog.Trigger>
      <NavIcon 
        title="Settings"
        Icon={<GearSix size={24} />}
        onClick={() => {}} 
      />
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 w-full h-full bg-primary/90 backdrop-blur-md z-[98] rounded-md" />
      <Dialog.Content className="fixed p-8 -translate-x-1/2 -translate-y-1/2 rounded-md top-1/2 left-1/2 bg-secondary w-[60vw] z-[99]">
        <Dialog.Title className="pb-8 m-0 font-medium">
          {t('user.edit.settings')}
        </Dialog.Title>
        <div className='flex flex-col w-full h-full'>
          <div className='flex items-center justify-between py-3 border-b border-subtle/5'>
            <div className='flex items-center gap-4 text-white/70'>
              <LanguageIcon size={24} />
              <h3 className=''>{t('user.edit.uiLanguage')}</h3>
            </div>
            <div className='w-64'>
              <EmojiOptionsInput
                options={[
                  { label: 'pt-BR', value: 'pt-BR', emoji: '🇧🇷' },
                  { label: 'en-US', value: 'en-US', emoji: '🇺🇸' },
                  { label: 'es-ES', value: 'es-ES', emoji: '🇪🇸' },
                ]}
                onSelect={value => {
                  i18next.changeLanguage(value)
                }}
                defaultValue={i18next.language}
              />
            </div>
          </div>
          {userOptions.map( option => {
            return <div className='flex items-center justify-between py-3 border-b border-subtle/5' key={option.label}>
              <div className='flex items-center gap-4 text-white/70'>
                {option.icon}
                <h3 className=''>{option.label}</h3>
              </div>
              {option.type === 'boolean' && (
                <label htmlFor={option.label} className="inline-flex items-center w-64 border rounded-md cursor-pointer bg-tertiary border-subtle/20">
                  <input 
                    id={option.label} 
                    type="checkbox" 
                    className="hidden peer" 
                    onChange={(e)=> {
                      // @ts-expect-error - We are already filtering the type
                      option.atom[1](e.target.checked)
                    }} 
                    // @ts-expect-error - We are already filtering the type
                    value={option.atom[0]}
                    // @ts-expect-error - We are already filtering the type
                    defaultChecked={option.atom[0]}
                  />
                  <span className="w-1/2 p-1 py-2 text-center bg-accent text-primary peer-checked:text-white peer-checked:bg-transparent rounded-l-md">
                    {t('generic.action.no')}
                  </span>
                  <span className="w-1/2 p-1 py-2 text-center peer-checked:bg-accent peer-checked:text-primary rounded-r-md">
                    {t('generic.action.yes')}
                  </span>
                </label>
              )}
              {option.type === 'options' && (
                <div className='w-64'>
                  <EmojiOptionsInput
                    options={option.options}
                    // @ts-expect-error - We are already filtering the type
                    defaultValue={option.atom[0]}
                  />
                </div>
              )}
            </div>
          })}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  )
}

export default NavSettings
