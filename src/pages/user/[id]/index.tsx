import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useQuery } from 'react-query'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Play } from 'phosphor-react'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import { useWindowSize } from 'usehooks-ts'

import SwiperAnime from '@/components/Anime/AnimeSwiper'
import UserComment from '@/components/Comments/UserComment'
import SwiperPlayerHead from '@/components/Episode/PlayerHeadSwiper'
import Button from '@/components/General/Button'
import Loading from '@/components/General/Loading'
import ContentContainer from '@/components/Layout/ContentContainer'
import GeneralLayout from '@/components/Layout/General'
import UserProfileSection from '@/components/User/ProfileSection'
import UserBadge from '@/components/User/UserBadge'
import UserCard from '@/components/User/UserCard'
import usePresence from '@/hooks/usePresence'
import { getLocaleMetadata } from '@/services/anima/getMetadataFromMedia'
import { User as UserService } from '@/services/anima/user'
import remarkEmbed from '@flowershow/remark-embed'

dayjs.extend(duration)

async function fetchUser(id: string | number) {
  if (!id) {
    return
  }

  if (id === 'me') {
    return await UserService.me()
  } else {
    return await UserService.get(Number(id))
  }
}

async function fetchPlayerHead(id: string | number) {
  if (!id) {
    return
  }

  if (id === 'me') {
    return await UserService.getMyPlayerHeads()
  } else {
    return await UserService.getPlayerHeads(Number(id))
  }
}

async function fetchLatestComments(id: string | number) {
  if (!id) {
    return
  }
  if (id === 'me') {
    const userData = await UserService.getUserData()
    id = userData.id
  }

  return await UserService.getLatestComments(Number(id))
}

async function fetchFriends(id: string | number) {
  if (!Number(id)) {
    return
  }

  return await UserService.getFriends(Number(id))
}

async function fetchFavorites(id: string | number) {
  if (!id) {
    return
  }

  return await UserService.getFavoriteAnimes(id)
}

const calculateItemsPerRow = (width: number) => {
  if (width < 1601) return 5
  // if (width < 1600) return 6
  if (width < 1921) return 6
  if (width < 2561) return 8
  if (width < 3841) return 10
  return 12
}

const User = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { clearPresence } = usePresence()
  const { width, height } = useWindowSize()
  
  const {
    data: userData,
    isLoading: userIsLoading,
    error: userError,
  } = useQuery(
    `/api/user/${router.query.id}`,
    () => {
      return fetchUser(router.query.id as string)
    },
    {
      refetchOnWindowFocus: false,
    }
  )
  const {
    data: userPlayerHead,
    isLoading: userPlayerHeadIsLoading,
    error: userPlayerHeadError,
  } = useQuery(
    `/api/user/${router.query.id}/player-head`,
    () => {
      return fetchPlayerHead(router.query.id as string)
    },
    {
      refetchOnWindowFocus: false,
    }
  )
  const {
    data: userComments,
    isLoading: userCommentsIsLoading,
    error: userCommentsError,
  } = useQuery(
    `/api/user/${router.query.id}/comments`,
    () => {
      return fetchLatestComments(router.query.id as string)
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  const {
    data: userFavorites,
    isLoading: userFavoritesLoading,
    error: userFavoritesError,
  } = useQuery(
    `/api/user/${router.query.id}/favorites/anime`,
    () => {
      console.log('We do be running')
      return fetchFavorites(router.query.id as string)
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  // const {
  //   data: userFriends,
  //   isLoading: userFirendsIsLoading,
  //   error: userFriendsError,
  // } = useQuery(
  //   `/api/user/${router.query.id}/friends`,
  //   () => fetchFriends(router.query.id as string)
  //   ,
  //   { refetchOnWindowFocus: false }
  // )


  useEffect(() => {
    if (!userData) {
      return
    }
    clearPresence('/user/' + userData.id, `@${userData.username}`)
  }, [userData])

  if (userIsLoading || !router.isReady)
    return (
      <GeneralLayout>
        <div className="absolute items-center justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <Loading sm />
        </div>
      </GeneralLayout>
    )

  if (userError)
    return (
      <GeneralLayout>
        <ContentContainer>
          <span className="absolute text-xs -translate-x-1/2 -translate-y-1/2 text-sublte top-1/2 left-1/2">ERR: No profile or invalid profile</span>
        </ContentContainer>
      </GeneralLayout>
    )

  return (
    <GeneralLayout fluid>
      <div
        className={'cover pointer-events-none absolute top-0 left-0 z-[0] h-screen w-screen overflow-hidden'}
        style={{ backgroundImage: `url('${userData?.profile?.background}')` }}
        >
        {userData?.profile?.background ? (
          ((userData?.profile?.background && userData?.profile?.background.endsWith('.mp4')) || userData?.profile?.background.endsWith('.webm')) && (
            <video autoPlay loop muted className="z-0 object-cover w-screen h-screen" src={userData?.profile?.background || '/i/splash/mp4'} />
          )
        ) : (
          <video autoPlay loop muted className="z-0 object-cover w-screen h-screen" src="/i/splash.mp4" />
        )}
        <div className="absolute inset-0 w-screen h-screen bg-gradient-to-t from-primary to-primary/60" />
      </div>
      <div className="z-[1] mt-28">
        <UserCard showEditButton={router.asPath === '/user/me'} user={userData} showStatics showAddConnectionButton={router.asPath === '/user/me'} />
      </div>
      <div className="z-[1] mt-8 flex w-full max-w-[99%] flex-row gap-4 px-8">
        <div className="flex flex-col w-1/5 h-6 gap-8">
          <UserProfileSection title={t('user.stats.badges')} overlayColor={userData.profile.color}>
            <div className="flex flex-wrap items-center justify-center w-screen gap-3 hnscreem">
              {userData?.profile?.Badge?.map((badge, i) => {
                if (!badge.icon) return
                return <UserBadge badge={badge} key={`user.${badge.name}.${i}`} className="w-8 h-8" />
              })}
            </div>
          </UserProfileSection>
          <UserProfileSection title={t('user.stats.friends')} overlayColor={userData.profile.color} />
        </div>
        <div className="flex flex-col w-4/5 gap-8">
          <UserProfileSection title={t('user.stats.bio')} overlayColor={userData.profile.color}>
            <div className="flex flex-col w-full anima-markdown">
              <div className="max-h-[900px] overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkEmbed, remarkGfm, remarkEmoji]} components={{}}>
                  {userData.profile.bio}
                </ReactMarkdown>
              </div>
            </div>
          </UserProfileSection>
          <UserProfileSection 
            title={t('user.stats.favorites')} 
            overlayColor={userData.profile.color}
            contentClassName='!w-full !flex !flex-col'
          >
              <SwiperAnime
                alwaysShowInfo
                animes={userFavorites?.data || []}
                animesPerScreen={calculateItemsPerRow(width)}
              />
              {/* {JSON.stringify(userFavorites)} */}
          </UserProfileSection>
          <UserProfileSection title={t('user.stats.history')}  overlayColor={userData.profile.color}>
            <div className="relative w-full">
              {userPlayerHead?.count > 0 && (
                <>
                  <SwiperPlayerHead playerHeads={userPlayerHead.data} slidesPerView={4} />
                  {userPlayerHead.count < 1 && (
                    <div className="w-full text-xs">
                      <span className=" text-subtle">👀</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </UserProfileSection>
          {!userCommentsError && userComments?.count > 0 && (
            <UserProfileSection title="Last comments" overlayColor={userData.profile.color} contentClassName="!flex-col gap-4">
              {userComments?.data?.map((comment, i) => {
                return (
                  <div className="flex flex-col p-2 border border-dashed rounded-md m border-subtle/30 bg-tertiary" key={`user.${comment.id}.${i}`}>
                    <div className="flex w-full h-full px-4 pt-3 pb-4 -mb-3 bg-secondary">
                      <div
                        className="w-32 mr-3 bg-center bg-cover rounded-md aspect-video bg-tertiary"
                        style={{
                          backgroundImage: `url('${comment.AnimeEpisode.thumbnail}')`,
                        }}
                      />
                      <div className="flex flex-col h-full my-auto">
                        <Link href={`/anime/${comment.AnimeEpisode.AnimeSeason.Anime.id}`}>
                          <h2 className="font-semibold cursor-pointer font-xl hover:text-accent">
                            {getLocaleMetadata<Anima.RAW.Anime, Anima.RAW.AnimeMetadata>(comment.AnimeEpisode.AnimeSeason.Anime)?.title ||
                              'Missing Anime Title'}
                          </h2>
                        </Link>
                        <h3 className="text-sm text-white/80">
                          S{comment.AnimeEpisode.AnimeSeason.number}E{comment.AnimeEpisode.number} •{' '}
                          {getLocaleMetadata<Anima.RAW.Episode, Anima.RAW.EpisodeMetadata>(comment.AnimeEpisode)?.title || 'Missing Episode Title'}
                        </h3>
                      </div>
                      <Button
                        Icon={<Play size={24} />}
                        text={t('anime.hero.button.watch')}
                        tertiary
                        xs
                        className="!my-auto mt-2 ml-auto flex !w-min gap-2 !py-2 hover:!bg-primary hover:!text-accent"
                        onClick={() => {
                          router.push(`/episode/${comment.AnimeEpisode.id}`)
                        }}
                      />
                    </div>
                    <UserComment disabled episodeID={comment.AnimeEpisode.id} comment={comment} />
                  </div>
                )
              })}
            </UserProfileSection>
          )}
        </div>
      </div>
    </GeneralLayout>
  )
}

export default User
