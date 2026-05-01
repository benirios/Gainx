'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type Props = {
  name: string
  defaultValue?: string[]
  disabled?: boolean
  placeholder?: string
}

export function TagInput({
  name,
  defaultValue = [],
  disabled = false,
  placeholder = 'Type a tag and press Enter',
}: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    // Silently ignore duplicates
    if (tags.includes(trimmed)) {
      setInputValue('')
      return
    }
    setTags((prev) => [...prev, trimmed])
    setInputValue('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center min-h-[40px] bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Serialized hidden input for form submission */}
      <input type="hidden" name={name} value={JSON.stringify(tags)} />

      {/* Tag chips */}
      {tags.map((tag) => (
        <Badge
          key={tag}
          className="bg-zinc-700 text-zinc-300 text-xs rounded-full px-2 py-0.5 flex items-center gap-1 hover:bg-zinc-700"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="text-zinc-400 hover:text-zinc-50 ml-0.5 leading-none"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      {/* Text input */}
      {!disabled && (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) addTag(inputValue)
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 h-auto text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
        />
      )}
    </div>
  )
}
