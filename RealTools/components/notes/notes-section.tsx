'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { NoteItem } from './note-item'
import { createNoteAction, type NoteState } from '@/lib/actions/note-actions'
import { toast } from 'sonner'

type Note = {
  id: string
  content: string
  created_at: string | null
  updated_at: string | null
  deal_id: string
}

const initialState: NoteState = {}

export function NotesSection({ notes, dealId }: { notes: Note[]; dealId: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [state, formAction, isPending] = useActionState(createNoteAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // Detect success: pending→not pending with no errors → hide form and reset
  const prevPending = useRef(false)
  useEffect(() => {
    if (prevPending.current && !isPending && !state.errors) {
      setShowAdd(false)
      formRef.current?.reset()
      toast.success('Note added.')
    }
    prevPending.current = isPending
  }, [isPending, state])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[20px] font-semibold text-foreground">Notes</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="size-4 mr-1" />
          Add Note
        </Button>
      </div>

      {showAdd && (
        <form ref={formRef} action={formAction} className="mb-4">
          <input type="hidden" name="deal_id" value={dealId} />
          <Textarea
            name="content"
            placeholder="Write a note…"
            rows={3}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground w-full"
            disabled={isPending}
          />
          {state.errors?.content && (
            <p className="text-sm text-destructive mt-1">{state.errors.content[0]}</p>
          )}
          {state.errors?.general && (
            <p className="text-sm text-destructive mt-1">{state.errors.general[0]}</p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdd(false)}
              disabled={isPending}
            >
              Discard
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
            </Button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showAdd ? (
        <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
