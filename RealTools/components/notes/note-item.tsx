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
      <div className="bg-muted/50 rounded-lg px-4 py-3">
        <form action={editAction}>
          <input type="hidden" name="note_id" value={note.id} />
          <input type="hidden" name="deal_id" value={note.deal_id} />
          <Textarea
            name="content"
            defaultValue={note.content}
            rows={3}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground w-full"
            disabled={isEditPending}
          />
          {editState.errors?.content && (
            <p className="text-sm text-destructive mt-1">{editState.errors.content[0]}</p>
          )}
          {editState.errors?.general && (
            <p className="text-sm text-destructive mt-1">{editState.errors.general[0]}</p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(false)}
              disabled={isEditPending}
            >
              Discard
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
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
    <div className="group bg-muted/50 rounded-lg px-4 py-3 min-h-[44px] hover:bg-muted/70 transition-colors">
      <p className="text-base text-foreground">{note.content}</p>
      <div className="flex items-center justify-between mt-2">
        <time className="text-xs text-muted-foreground">{timestamp}</time>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This note will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
                  Keep
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deletePending}
                  className="bg-destructive hover:bg-destructive/90 text-white"
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
