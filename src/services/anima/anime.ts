import client from '@/services/anima/httpService'

export const Anime = {
  get: async function (id: number) {
    const { data } = await client.get(`/anime/${id}`)
    return data as Anima.API.GetAnimeByID
  },

  getAll: async function (limit: number = 10, offset: number = 0) {
    const { data } = await client.get('/anime', {
      params: {
        count: limit,
        start: offset,
      },
    })
    return data as Anima.API.GetAnimes
  },

  getLatest: async function () {
    const { data } = await client.get('/anime/latest')

    return data as Anima.API.GetCategoryAnimes
  },

  getByCategory: async function (categoryID: number) {
    const { data } = await client.get(`/category/${categoryID}/animes`)

    return data as Anima.API.GetCategoryAnimes
  },

  getByCategories: async function (slugs: string[], start: number = 0) {
    const { data } = await client.get('/category/animes', {
      params: {
        slugs: slugs.join(','),
        start,
      },
    })

    return data as Anima.API.GetAnimes
  },

  getSeasons: async function (id: number) {
    const { data } = await client.get(`/anime/${id}/seasons`)

    return data as Anima.API.GetAnimeSeasons
  },

  search: async function (query: string) {
    const { data } = await client.get('/search/animes', {
      params: {
        q: query,
      },
    })
    return data as Anima.API.SearchAnimes
  },
}
