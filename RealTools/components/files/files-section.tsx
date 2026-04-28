'use client'

import { useState } from 'react'
import { Upload, FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { insertDealFileAction, deleteDealFileAction } from '@/lib/actions/file-actions'
import { toast } from 'sonner'

type DealFile = {
  id: string
  file_name: string
  storage_path: string
  signedUrl: string | null
  deal_id: string
}

export function FilesSection({
  files,
  dealId,
  userId,
}: {
  files: DealFile[]
  dealId: string
  userId: string
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum 50MB.')
      e.target.value = ''
      return
    }

    setUploading(true)
    const supabase = createSupabaseBrowserClient()
    // Path: {user_id}/{deal_id}/{timestamp}-{filename} — required by Storage RLS policy
    const path = `${userId}/${dealId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('deal-files')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      toast.error('Failed to upload file.')
      setUploading(false)
      e.target.value = ''
      return
    }

    const result = await insertDealFileAction({
      dealId,
      storagePath: path,
      fileName: file.name,
    })

    setUploading(false)
    e.target.value = ''

    if (result.error) {
      toast.error('File uploaded but record failed. Please refresh.')
    } else {
      toast.success('File uploaded.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-zinc-50">Files</h2>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-zinc-800">
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="size-4" />
                <span>Upload File</span>
              </>
            )}
          </span>
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">No files uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

function FileRow({ file }: { file: DealFile }) {
  const [deletePending, setDeletePending] = useState(false)

  async function handleDelete() {
    setDeletePending(true)
    const result = await deleteDealFileAction({
      fileId:      file.id,
      storagePath: file.storage_path,
      dealId:      file.deal_id,
    })
    setDeletePending(false)
    if (result.error) {
      toast.error('Failed to delete. Please try again.')
    } else {
      toast.success('Deleted.')
    }
  }

  return (
    <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3 min-h-[44px]">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="size-4 text-zinc-400 shrink-0" />
        <span className="text-base text-zinc-50 truncate">{file.file_name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {file.signedUrl && (
          <a
            href={file.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            <Download className="size-4" />
            Download
          </a>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-400"
              aria-label="Delete file"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This file will be permanently deleted from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700 text-zinc-50 hover:bg-zinc-800">
                Keep
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deletePending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
