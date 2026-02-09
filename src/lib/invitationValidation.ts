import { z } from 'zod';

export const invitationRequestSchema = z.object({
  club_slug: z.string().min(1, "Club is required"),
  language: z.enum(['en', 'es', 'de', 'fr', 'it']),
  visit_date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Visit date must be today or in the future"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, "Phone number must be 9-15 digits with optional + prefix"),
  visitor_count: z.number()
    .min(1, "At least 1 visitor is required")
    .max(10, "Maximum 10 visitors allowed"),
  visitor_names: z.array(z.string().trim().min(1, "Name cannot be empty"))
    .min(1, "At least one visitor name is required"),
  visitor_first_names: z.array(z.string().trim().min(1, "First name cannot be empty"))
    .min(1, "At least one first name is required"),
  visitor_last_names: z.array(z.string().trim().min(1, "Last name cannot be empty"))
    .min(1, "At least one last name is required"),
  legal_age_confirmed: z.boolean().refine((val) => val === true, "You must confirm you are 18 or older"),
  legal_knowledge_confirmed: z.boolean().refine((val) => val === true, "You must confirm you understand Spanish cannabis legislation"),
  gdpr_consent: z.boolean().refine((val) => val === true, "You must consent to data processing"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

export type InvitationRequest = z.infer<typeof invitationRequestSchema>;
