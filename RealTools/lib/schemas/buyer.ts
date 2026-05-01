import { z } from 'zod'

export const BuyerSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  tags:  z.array(z.string()).default([]),
})

export type BuyerFormValues = z.infer<typeof BuyerSchema>

export type BuyerState = {
  errors?: {
    name?:    string[]
    email?:   string[]
    tags?:    string[]
    general?: string[]
  }
}
