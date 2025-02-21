import i18next from 'i18next'

export type AnimaMediaMetadata = {
  [key: string]: Anima.RAW.AnimeMetadata
}

export function getLocaleMetadata<T, TM>(media: T): TM {
  let locale = i18next.language

  if (locale === 'pt-PT') {
    locale = 'pt-BR'
  }

  if (!media) return {} as TM
  //@ts-expect-error
  if (media?.AnimeMetadata) {
    //@ts-expect-error
    return media.AnimeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error
  if (media?.AnimeEpisodeMetadata) {
    //@ts-expect-error
    return media.AnimeEpisodeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error
  if (media?.EpisodeMetadata) {
    //@ts-expect-error
    return media.EpisodeMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  //@ts-expect-error
  if (media?.categoryMetadata) {
    //@ts-expect-error
    return media.categoryMetadata.find((metadata) => metadata.locale === locale) as TM
  }

  //@ts-expect-error
  if (media?.CategoryMetadata) {
    //@ts-expect-error
    return media.CategoryMetadata.find((metadata) => metadata.locale_key === locale) as TM
  }

  return {} as TM
}
