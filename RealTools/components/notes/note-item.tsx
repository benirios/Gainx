'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { updateNoteAction, deleteNoteAction, type NoteState } from '@/lib/actions/note-actions'
import { toast } from 'sonner'

type Note = {
  id: string
  content: string
  created_at: string | null
  updated_at: string | null
  deal_id: string
}

const initialEditState: NoteState = {}

export function NoteItem({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [editState, editAction, isEditPending] = useActionState(updateNoteAction, initialEditState)

  // Detect transition from pending → not pending with no errors → success (exit edit mode)
  const prevPending = useRef(false)
  useEffect(() => {
    if (prevPending.current && !isEditPending && !editState.errors) {
      setEditing(false)
      toast.success('Note updated.')
    }
    prevPending.current = isEditPending
  }, [isEditPending, editState])

  async function handleDelete() {
    setDeletePending(true)
    const result = await deleteNoteAction(note.id, note.deal_id)
    setDeletePending(false)
    if (result.error) {
      toast.error('Failed to delete. Please try again.')
    } else {
      toast.success('Deleted.')
    }
  }

  const displayDate = note.updated_at ?? note.created_at
  const timestamp = displayDate
    ? new Date(displayDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  if (editing) {
    return (
      <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
        <form action={editAction}>
          <input type="hidden" name="note_id" value={note.id} />
          <input type="hidden" name="deal_id" value={note.deal_id} />
          <Textarea
            name="content"
            defaultValue={note.content}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 w-full"
            disabled={isEditPending}
          />
          {editState.errors?.content && (
            <p className="text-sm text-red-500 mt-1">{editState.errors.content[0]}</p>
          )}
          {editState.errors?.general && (
            <p className="text-sm text-red-500 mt-1">{editState.errors.general[0]}</p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-zinc-50"
              onClick={() => setEditing(false)}
              disabled={isEditPending}
            >
              Discard
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-white text-zinc-950 hover:bg-zinc-100"
              disabled={isEditPending}
            >
              {isEditPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="group bg-zinc-800/50 rounded-lg px-4 py-3 min-h-[44px]">
      <p className="text-base text-zinc-50">{note.content}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-zinc-400">{timestamp}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
            onClick={() => setEditing(true)}
            aria-label="Edit note"
          >
            <Pencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This note will be permanently deleted.
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
    </div>
  )
}
