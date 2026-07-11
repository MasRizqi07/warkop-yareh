import { z } from "zod";

export const ExampleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
});

export type Example = z.infer<typeof ExampleSchema>;
