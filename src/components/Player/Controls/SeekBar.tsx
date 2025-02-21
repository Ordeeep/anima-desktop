import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAtom } from 'jotai'

import SkipBar from '@/components/Player/Controls/SkipBar'
import { anilistService } from '@/services/anilist/anilistService'
import { animeSkipService } from '@/services/animeSkip/animeSkipService'
import { Chapters } from '@/services/aniskip/chapters'
import { playerStreamConfig } from '@/stores/atoms'
import { BIFParser } from '@/utils/bif'
import { clamp, fetchBifFromURL } from '@/utils/helpers'
import { MediaSliderValue, MediaTimeSlider, useMediaStore  } from '@vidstack/react'
import { useSliderStore } from '@vidstack/react'

import 'vidstack/styles/base.css'
import Timestamp from './Timestamp'

interface ISeekBarProps {
  animeData: Anima.RAW.Anime
  episodeData: Anima.RAW.Episode
  seasonData: Anima.RAW.Season
  showSkipBar?: boolean
  disabled?: boolean
}

export type CommonChapterFormat = {
  identificator: string,
  startTime: number,
  endTime: number,
}

const SeekBar: React.FunctionComponent<ISeekBarProps> = ({animeData, episodeData, seasonData, showSkipBar = true, disabled}) => {
  const slider = useRef(null)
  
  const [episodeChapters, setEpisodeChapters] = useState<CommonChapterFormat[] | null>(null)
  const [streamConfig] = useAtom(playerStreamConfig)
  const [currentThumbnailURL, setCurrentThumbnailURL] = useState<string | null>(null)
  const [bif, setBif] = useState<BIFParser>(null)
  const { duration, canPlay, currentTime, bufferedEnd } = useMediaStore()
  const { pointerValue } = useSliderStore(slider)
  const { t } = useTranslation()

  function getHoverChapterName() {
    if (!episodeChapters) { return 'anime.chapter.episode'}
    const currentChapter = episodeChapters.find((chapter) => {
      return (duration * (pointerValue/ 100)) >= chapter.startTime && (duration * (pointerValue/ 100)) <= chapter.endTime
    })
    if (!currentChapter) { return 'anime.chapter.episode' }
    return currentChapter.identificator
  }

  function getcurrentChapter() {
    if (!episodeChapters) { return }
    const currentChapter = episodeChapters.find((chapter) => {
      return currentTime >= chapter.startTime && currentTime <= chapter.endTime
    })
    if (!currentChapter) { return }
    return currentChapter
  }

  useEffect(()=>{
    if (!animeData.id) { return }
    if (!canPlay) { return }

    ;(async () => {
      const anilistData = await anilistService.getMALIDFromName(animeData.AnimeMetadata.find(a => a.locale_key === 'en-US')?.title)
      const malID = await (await anilistData)?.idMal
      if (!malID) { return }

      let commonChapters: CommonChapterFormat[] = []

      try {
        const aniskipChapters = await Chapters.get(malID, episodeData.number, duration)
        // if (aniskipChapters.results.length < 2) { throw new Error('Not enough chapters')}

        commonChapters = aniskipChapters.results.map((chapter) => {
          return {
            identificator: 'anime.chapter.' + chapter.skipType.toLocaleLowerCase().replaceAll(' ', '_'),
            startTime: chapter.interval.startTime,
            endTime: chapter.interval.endTime,
          }
        }) as CommonChapterFormat[]

      } catch (e) {
        // Only try using anime-skip if aniskip fails
        const animeSkipChapters = await animeSkipService.getAnimeByName(animeData.AnimeMetadata.find(a => a.locale_key === 'en-US')?.title)

        const matchingEpisode = animeSkipChapters?.episodes.find(ep => {
          if (ep.season && Number(ep.season) !== seasonData.number) return false
          return Number(ep.number) === episodeData.number || Number(ep.absoluteNumber) === episodeData.number
        })

        if(matchingEpisode) {
          commonChapters = matchingEpisode.timestamps.map((chapter, index) => {
            const nextChapter = matchingEpisode.timestamps[index + 1]

            return {
              identificator: 'anime.chapter.' + chapter.type.name.toLocaleLowerCase().replaceAll(' ', '_'),
              startTime: chapter.at,
              endTime: nextChapter ? nextChapter.at : matchingEpisode.baseDuration,
            }
          }) as CommonChapterFormat[]
        }
      }

      if (!commonChapters.length) { return }
      
      // The opening chapter is always the first chapter, so if the first chapter starts after 1 second, add a new chapter with the identificator 'teaser' to fill the gap.
      if (commonChapters.sort((a,b)=> a.startTime - b.startTime)[0].startTime > 1) {
        commonChapters.unshift({
          identificator: 'anime.chapter.teaser',
          startTime: 0,
          endTime: commonChapters.sort((a,b)=> a.startTime - b.startTime)[0].startTime,
        })
      }

      // The ending is not until the end of the anime, so we add a new chapter as post-episode.
      // We have to check if it's actually after the ending to call it post credits, otherwise it's just episode.
      if (commonChapters[commonChapters.length-1].endTime < duration - 1) {
        const previousChapter = commonChapters[commonChapters.length-1]

        commonChapters.splice(commonChapters.length-1, 0, {
          identificator: previousChapter.identificator === 'anime.chapter.ed' 
            || previousChapter.identificator === 'anime.chapter.credits' 
            || previousChapter.identificator === 'anime.chapter.mixeded' 
            || previousChapter.identificator === 'anime.chapter.mixed-ed'
            || previousChapter.identificator === 'anime.chapter.mixed_credits'
            || previousChapter.identificator === 'anime.chapter.outro'
            || previousChapter.identificator === 'anime.chapter.new_credits' ? 'anime.chapter.post_credits' : 'anime.chapter.episode',
          startTime: commonChapters[commonChapters.length-1].endTime + .04,
          endTime: duration,
        })
      }

      // Look for all chapters ordered by time, if the gap between the current and previous episode is 1 second or more, add a new chapter between them with the identificator 'Episode'.
      commonChapters.sort((a,b)=> a.startTime - b.startTime).forEach((chapter, index)=>{
        const lastChapter = commonChapters[index - 1]
        if (lastChapter && ~~(chapter.startTime - lastChapter?.endTime) > 0) {
          commonChapters.splice(index, 0, {
            identificator: 'anime.chapter.canon',
            startTime: lastChapter.endTime + .04,
            endTime: chapter.startTime - .04,
          })
        }
      })

      // If the API mistakenly sets the end time to happen more than 5 minutes before the end of the epiode we clear the whole thing because it's probably borked!

      setEpisodeChapters(commonChapters)
    })()
  }, [animeData, canPlay, duration])

  useEffect(()=>{
    if (!slider.current) { return }
    if (streamConfig.streamThumbnail === '') { return }
    if (currentThumbnailURL === streamConfig.streamThumbnail) { return }
    
    ;(async ()=>{
      try{
        setBif(await fetchBifFromURL(`http://127.0.0.1:15411/${btoa(streamConfig.streamThumbnail)}`))
        setCurrentThumbnailURL(streamConfig.streamThumbnail)
      } catch {
        console.log('Anime from poor people to poor people')
      }
    })()
  },[streamConfig.streamThumbnail, slider, streamConfig.streamURL])

  return <div className='relative flex flex-col justify-center w-full overflow-visible pointer-events-auto'>
    { currentTime > 0 && showSkipBar && <SkipBar chapter={getcurrentChapter()} duration={duration} episodeId={episodeData.id} nextEpisodeId={seasonData.AnimeEpisode.find(e => e.number > episodeData.number)?.id}/> }
    <div className='flex gap-2'>
      <Timestamp type='current'/> 
      <MediaTimeSlider 
        className='flex w-full items-center !overflow-visible group'
        ref={slider}
      >
          {/* CHAPTERS */}
          {episodeChapters ? (
            episodeChapters.sort((a,b)=> a.startTime - b.startTime).map( (chapter, chapterIndex) => {           
              const chapterPerc = Number(((chapter.startTime / duration) * 100).toFixed(1))
              const nextChapterPerc = Number(((chapter.endTime / duration) * 100).toFixed(1))
              const progressPerc = clamp((currentTime - chapter.startTime) / (chapter.endTime - chapter.startTime) * 100,0 ,100)
              const bufferPerc = clamp((bufferedEnd - chapter.startTime) / (chapter.endTime - chapter.startTime) * 100,0 ,100)
              return  <div
                className='h-2 origin-left transition-[height] duration-100 hover:h-2 group overflow-visible relative flex items-center'
                style={{ 
                  width: `${nextChapterPerc - chapterPerc}%`,
                  maxWidth: '100%',
                  paddingLeft: (nextChapterPerc - chapterPerc) > 5 ? '2px' : '2px',
                  paddingRight: (nextChapterPerc - chapterPerc) > 5 ? '2px' : '2px'
                }}
                key={`chapter.seeker.${chapterIndex}`}
                >
                  {/* BACKGROUND */}
                  <div className=' hover:bg-white/40 bg-white/20 w-full h-1 hover:h-2 transition-[height] peer flex overflow-hidden relative'>
                    {/* PROGRESS */}
                    <div className='h-full bg-accent pointer-events-none z-[1]' style={{width: `${progressPerc}%`,}} />
                    {/* BUFFER */}
                    <div className='absolute inset-0 h-full pointer-events-none bg-white/20' style={{ width: `${bufferPerc}%`}} />
                  </div>
                </div>
          })) : (
              // BACKGROUND
              <div className='h-2 group w-full transition-[height] duration-100 group rounded-md flex items-center overflow-hidden'>
                <div 
                  className='bg-white/20 h-1 group-hover:h-2 pointer-events-none transition-[height] duration-100 w-full flex items-center' 
                >
                  {/* // PROGRESS */}
                  <div 
                    className='h-1 group-hover:h-2 duration-100 transition-[height] bg-accent z-[1]' 
                    style={{
                      width: `${(currentTime / duration) * 100}%`,
                    }} 
                  />
                  {/* // BUFFER */}
                  <div 
                    className='absolute top-1/2 left-0 h-1 group-hover:h-2 duration-100 transition-[height] w-full -translate-y-1/2 scale-x-[calc(var(--media-buffered)/var(--media-duration))] transform bg-white/40 will-change-transform' 
                    style={{ transformOrigin: 'left center' }}
                  />
                </div>
              </div>
          )}
          
          {/* POINTER  INFORMATION*/}
          <div 
            className='absolute left-[var(--slider-pointer-percent)] flex-col items-center -translate-y-1/2 mb-6 -translate-x-1/2 h-min flex group-hover:opacity-100 opacity-0 duration-100 transition-opacity pointer-events-none gap-1'
          >
            <div className='flex flex-col items-center order-1 text-xs h-min'>
              {/* PREVIEW */}
              { bif && <div 
                className='w-48 min-w-[12rem] aspect-video pointer-events-none rounded-md shadow-lg border border-tertiary bg-secondary' 
                style={{ backgroundImage: `url(${bif.getImageDataAtSecond(~~(pointerValue / 100 * duration))})` }}
              /> }
              <MediaSliderValue type='pointer' format='time' className='absolute order-2 px-2 py-1 font-semibold rounded pointer-events-none opacity-80 h-min bottom-5 bg-secondary'/>
              <span className=''>{t(getHoverChapterName())}</span>
            </div>
          </div>
          
      </MediaTimeSlider>
      <Timestamp type='duration'/>
    </div>
  </div>
}


export default SeekBar
