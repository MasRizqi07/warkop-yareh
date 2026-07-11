import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reservation {
  id: string;
  zone: string;
  spotId: string;
  spotName: string;
  date: string; // e.g., "12 Nov"
  time: string; // e.g., "11:00 AM"
  price: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: number;
}

interface ReservationState {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, "id" | "createdAt" | "status">) => Reservation;
  cancelReservation: (id: string) => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set) => ({
      reservations: [],

      addReservation: (reservationData) => {
        const newReservation: Reservation = {
          ...reservationData,
          id: "RES-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: Date.now(),
          status: "CONFIRMED",
        };

        set((state) => ({
          reservations: [newReservation, ...state.reservations],
        }));

        return newReservation;
      },

      cancelReservation: (id: string) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: "CANCELLED" } : r
          ),
        }));
      },
    }),
    {
      name: "cnb-reservation-store",
    }
  )
);
