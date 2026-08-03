import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaService } from '@/services/mediaService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'

export function useMedia(type: string, uuid: string) {
  return useQuery({
    queryKey: ['media', type, uuid],
    queryFn: async () => {
      const res = await mediaService.list(type, uuid)
      return res.data.media.data
    },
    enabled: !!type && !!uuid,
  })
}

export function useAddMedia(type: string, uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (files: File[]) => mediaService.create(type, uuid, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media', type, uuid] })
      toast.success(t('media.added'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('media.addError'))
    },
  })
}

export function useDeleteMedia(type: string, uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (mediaUuid: string) =>
      mediaService.destroy(type, uuid, mediaUuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media', type, uuid] })
      toast.success(t('media.deleted'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('media.deleteError'))
    },
  })
}
