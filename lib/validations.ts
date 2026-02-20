import { z } from 'zod'


// Theme and appearance schemas
export const themeAccentSchema = z.enum(['blue', 'emerald', 'violet', 'rose'])
export const recurringFrequencySchema = z.enum(['weekly', 'monthly', 'yearly'])
export const timeGrainSchema = z.enum(['week', 'month', 'year'])

// Expense schema
export const expenseSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  category_id: z.string().uuid('Please select a valid category').nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
})

export const expenseFormSchema = expenseSchema.extend({
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return !isNaN(parsed) && parsed > 0
      }
      return typeof val === 'number' && val > 0
    }, 'Amount must be a positive number')
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return val
    }),
})

// Income schema
export const incomeSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  category_id: z.string().uuid('Please select a valid category').nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
})

export const incomeFormSchema = incomeSchema.extend({
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return !isNaN(parsed) && parsed > 0
      }
      return typeof val === 'number' && val > 0
    }, 'Amount must be a positive number')
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return val
    }),
})

// Recurring item schema
export const recurringItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  category_id: z.string().uuid('Please select a valid category').nullable(),
  frequency: recurringFrequencySchema,
  next_due_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid due date',
  }),
})

export const recurringItemFormSchema = recurringItemSchema.extend({
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return !isNaN(parsed) && parsed > 0
      }
      return typeof val === 'number' && val > 0
    }, 'Amount must be a positive number')
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? 0 : parsed
      }
      return val
    }),
})

// Profile/Settings schema
export const profileSchema = z.object({
  theme_preference: themeAccentSchema,
  dark_mode: z.boolean(),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be 72 characters or less'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

// Type exports
export type ExpenseSchemaType = z.infer<typeof expenseSchema>
export type ExpenseFormSchemaType = z.infer<typeof expenseFormSchema>
export type RecurringItemSchemaType = z.infer<typeof recurringItemSchema>
export type RecurringItemFormSchemaType = z.infer<typeof recurringItemFormSchema>
export type IncomeSchemaType = z.infer<typeof incomeSchema>
export type IncomeFormSchemaType = z.infer<typeof incomeFormSchema>
export type ProfileSchemaType = z.infer<typeof profileSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>
export type SignupSchemaType = z.infer<typeof signupSchema>
