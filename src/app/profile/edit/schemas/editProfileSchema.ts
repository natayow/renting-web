import { z } from 'zod';

export const editProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(80, 'Full name must be at most 80 characters'),
  email: z.string().email('Invalid email format').max(120, 'Email must be at most 120 characters'),
  phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional().nullable(),
  picture: z.any().optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
