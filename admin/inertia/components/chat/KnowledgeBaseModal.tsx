import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import FileUploader from '~/components/file-uploader'
import StyledButton from '~/components/StyledButton'
import StyledSectionHeader from '~/components/StyledSectionHeader'
import StyledTable from '~/components/StyledTable'
import { useNotifications } from '~/context/NotificationContext'
import api from '~/lib/api'
import { IconX } from '@tabler/icons-react'
import { useModals } from '~/context/ModalContext'
import StyledModal from '../StyledModal'
import ActiveEmbedJobs from '~/components/ActiveEmbedJobs'

interface KnowledgeBaseModalProps {
  aiAssistantName?: string
  onClose: () => void
}

function sourceToDisplayName(source: string): string {
  const parts = source.split(/[/\\]/)
  return parts[parts.length - 1]
}

export default function KnowledgeBaseModal({ aiAssistantName = "Assistant IA", onClose }: KnowledgeBaseModalProps) {
  const { addNotification } = useNotifications()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [confirmDeleteSource, setConfirmDeleteSource] = useState<string | null>(null)
  const fileUploaderRef = useRef<React.ComponentRef<typeof FileUploader>>(null)
  const { openModal, closeModal } = useModals()
  const queryClient = useQueryClient()

  const { data: storedFiles = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ['storedFiles'],
    queryFn: () => api.getStoredRAGFiles(),
    select: (data) => data || [],
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadDocument(file),
  })

  const deleteMutation = useMutation({
    mutationFn: (source: string) => api.deleteRAGFile(source),
    onSuccess: () => {
      addNotification({ type: 'success', message: 'Fichier supprimé de la base de connaissance.' })
      setConfirmDeleteSource(null)
      queryClient.invalidateQueries({ queryKey: ['storedFiles'] })
    },
    onError: (error: any) => {
      addNotification({ type: 'error', message: error?.message || 'Échec de suppression du fichier.' })
      setConfirmDeleteSource(null)
    },
  })

  const cleanupFailedMutation = useMutation({
    mutationFn: () => api.cleanupFailedEmbedJobs(),
    onSuccess: (data) => {
      addNotification({ type: 'success', message: data?.message || 'Jobs en échec nettoyés.' })
      queryClient.invalidateQueries({ queryKey: ['failedEmbedJobs'] })
    },
    onError: (error: any) => {
      addNotification({ type: 'error', message: error?.message || 'Échec du nettoyage des jobs.' })
    },
  })

  const syncMutation = useMutation({
    mutationFn: () => api.syncRAGStorage(),
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: data?.message || 'Stockage synchronisé. Les nouveaux fichiers détectés ont été mis en file de traitement.',
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error?.message || 'Échec de la synchronisation du stockage',
      })
    },
  })

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    let successCount = 0
    const failedNames: string[] = []

    for (const file of files) {
      try {
        await uploadMutation.mutateAsync(file)
        successCount++
      } catch (error: any) {
        failedNames.push(file.name)
      }
    }

    setIsUploading(false)
    setFiles([])
    fileUploaderRef.current?.clear()
    queryClient.invalidateQueries({ queryKey: ['embed-jobs'] })

    if (successCount > 0) {
      addNotification({
        type: 'success',
        message: `${successCount} fichier${successCount > 1 ? 's' : ''} mis en file de traitement.`,
      })
    }
    for (const name of failedNames) {
      addNotification({ type: 'error', message: `Échec du téléversement : ${name}` })
    }
  }

  const handleConfirmSync = () => {
    openModal(
      <StyledModal
        title='Confirmer la synchronisation ?'
        onConfirm={() => {
          syncMutation.mutate()
          closeModal(
            "confirm-sync-modal"
          )
        }}
        onCancel={() => closeModal("confirm-sync-modal")}
        open={true}
        confirmText='Confirmer'
        cancelText='Annuler'
        confirmVariant='primary'
      >
        <p className='text-text-primary'>
          Cette action analysera les répertoires de stockage NOMAD pour détecter de nouveaux fichiers et les mettre en file de traitement. C’est utile si vous avez ajouté des fichiers manuellement ou si vous voulez forcer une remise à jour.
          Cela peut augmenter temporairement la consommation de ressources pendant le traitement. Voulez-vous continuer ?
        </p>
      </StyledModal>,
      "confirm-sync-modal"
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="bg-surface-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0">
          <h2 className="text-2xl font-semibold text-text-primary">Base de connaissance</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <IconX className="h-6 w-6 text-text-muted" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="bg-surface-primary rounded-lg border shadow-md overflow-hidden">
            <div className="p-6">
              <FileUploader
                ref={fileUploaderRef}
                minFiles={1}
                maxFiles={5}
                onUpload={(uploadedFiles) => {
                  setFiles(Array.from(uploadedFiles))
                }}
              />
              <div className="flex justify-center gap-4 my-6">
                <StyledButton
                  variant="primary"
                  size="lg"
                  icon="IconUpload"
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading}
                  loading={isUploading}
                >
                  Téléverser
                </StyledButton>
              </div>
            </div>
            <div className="border-t bg-surface-primary p-6">
              <h3 className="text-lg font-semibold text-desert-green mb-4">
                Pourquoi téléverser des documents dans votre base de connaissance ?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-desert-green text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-desert-stone-dark">
                      Intégration avec la base de connaissance de {aiAssistantName}
                    </p>
                    <p className="text-sm text-desert-stone">
                      Quand vous téléversez des documents, NOMAD les traite et les indexe pour les rendre accessibles à {aiAssistantName}. Cela permet à {aiAssistantName} de se baser sur vos documents pendant les conversations et d’offrir des réponses plus précises et personnalisées.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-desert-green text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-desert-stone-dark">
                      Traitement enrichi des documents avec OCR
                    </p>
                    <p className="text-sm text-desert-stone">
                      NOMAD intègre l’OCR (reconnaissance optique de caractères), ce qui permet d’extraire du texte depuis des documents image (PDF scannés, photos, etc.). Même sans format texte standard, le contenu peut être traité et indexé pour l’IA.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-desert-green text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-desert-stone-dark">
                      Intégration avec la bibliothèque d’information
                    </p>
                    <p className="text-sm text-desert-stone">
                      NOMAD peut découvrir et extraire automatiquement le contenu stocké dans votre bibliothèque d’information (si installée), puis le rendre disponible pour {aiAssistantName} sans étape manuelle supplémentaire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <StyledSectionHeader title="File de traitement" className="!mb-0" />
              <StyledButton
                variant="danger"
                size="md"
                icon="IconTrash"
                onClick={() => cleanupFailedMutation.mutate()}
                loading={cleanupFailedMutation.isPending}
                disabled={cleanupFailedMutation.isPending}
              >
                Nettoyer les échecs
              </StyledButton>
            </div>
            <ActiveEmbedJobs withHeader={false} />
          </div>

          <div className="my-12">
            <div className='flex items-center justify-between mb-6'>
              <StyledSectionHeader title="Fichiers stockés de la base de connaissance" className='!mb-0' />
              <StyledButton
                variant="secondary"
                size="md"
                icon='IconRefresh'
                onClick={handleConfirmSync}
                disabled={syncMutation.isPending || isUploading}
                loading={syncMutation.isPending || isUploading}
              >
                Synchroniser le stockage
              </StyledButton>
            </div>
            <StyledTable<{ source: string }>
              className="font-semibold"
              rowLines={true}
              columns={[
                {
                  accessor: 'source',
                  title: 'Nom du fichier',
                  render(record) {
                    return <span className="text-text-primary">{sourceToDisplayName(record.source)}</span>
                  },
                },
                {
                  accessor: 'source',
                  title: '',
                  render(record) {
                    const isConfirming = confirmDeleteSource === record.source
                    const isDeleting = deleteMutation.isPending && confirmDeleteSource === record.source
                    if (isConfirming) {
                      return (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-text-secondary">Supprimer de la base de connaissance ?</span>
                          <StyledButton
                            variant='danger'
                            size='sm'
                            onClick={() => deleteMutation.mutate(record.source)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Suppression…' : 'Confirmer'}
                          </StyledButton>
                          <StyledButton
                            variant='ghost'
                            size='sm'
                            onClick={() => setConfirmDeleteSource(null)}
                            disabled={isDeleting}
                          >
                            Annuler
                          </StyledButton>
                        </div>
                      )
                    }
                    return (
                      <div className="flex justify-end">
                        <StyledButton
                          variant="danger"
                          size="sm"
                          icon="IconTrash"
                          onClick={() => setConfirmDeleteSource(record.source)}
                          disabled={deleteMutation.isPending}
                          loading={deleteMutation.isPending && confirmDeleteSource === record.source}
                        >Supprimer</StyledButton>
                      </div>
                    )
                  },
                },
              ]}
              data={storedFiles.map((source) => ({ source }))}
              loading={isLoadingFiles}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
