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
        <h2 className="text-base font-semibold text-zinc-50">Notes</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-zinc-50"
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
            className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 w-full"
            disabled={isPending}
          />
          {state.errors?.content && (
            <p className="text-sm text-red-500 mt-1">{state.errors.content[0]}</p>
          )}
          {state.errors?.general && (
            <p className="text-sm text-red-500 mt-1">{state.errors.general[0]}</p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-zinc-50"
              onClick={() => setShowAdd(false)}
              disabled={isPending}
            >
              Discard
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-white text-zinc-950 hover:bg-zinc-100"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
            </Button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showAdd ? (
        <p className="text-sm text-zinc-400 text-center py-4">No notes yet.</p>
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
