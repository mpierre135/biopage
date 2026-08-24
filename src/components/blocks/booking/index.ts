import { z } from "zod";
import { CalendarDays } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { BookingRender } from "./render";
import { BookingEditor } from "./editor";

export const bookingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  durationMinutes: z.number().optional(),
  price: z.number().optional(),
  bookingUrl: z.string().optional(),
});

export type BookingConfig = z.infer<typeof bookingSchema>;

export const bookingDescriptor: BlockDescriptor<BookingConfig> = {
  type: "BOOKING",
  label: "Booking",
  description: "Let visitors book time with you",
  icon: CalendarDays,
  category: "commerce",
  schema: bookingSchema,
  defaultConfig: {
    title: "Book a call",
    durationMinutes: 30,
  },
  Render: BookingRender,
  Editor: BookingEditor,
};
