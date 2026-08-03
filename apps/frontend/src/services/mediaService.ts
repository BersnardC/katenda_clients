import api from './api'
import type { Paginated } from '@/types/pagination'
import type { Media } from '@/types/models'

export const mediaService = {
  list: (type: string, uuid: string) =>
    api.get<{ media: Paginated<Media> }>(`/${type}/${uuid}/media`),
  create: (type: string, uuid: string, files: File[]) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('images[]', f))
    return api.post<{ media: Media[] }>(`/${type}/${uuid}/media`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  destroy: (type: string, uuid: string, mediaUuid: string) =>
    api.delete(`/${type}/${uuid}/media/${mediaUuid}`),
}
