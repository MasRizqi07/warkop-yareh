import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MembershipTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  image?: string;
  category: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  memberSince: number; // year
}

interface UserState {
  profile: UserProfile;
  tier: MembershipTier;
  points: number;
  redeemedRewards: Reward[];
  // Actions
  addPoints: (amount: number) => void;
  redeemReward: (reward: Reward) => boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  getPointsToNextTier: () => { nextTier: MembershipTier | null; pointsNeeded: number; progress: number };
}

const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 3000,
  PLATINUM: 10000,
};

function determineTier(points: number): MembershipTier {
  if (points >= TIER_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (points >= TIER_THRESHOLDS.GOLD) return "GOLD";
  if (points >= TIER_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: {
        name: "Aris",
        email: "aris@example.com",
        phone: "+62 812 3456 7890",
        memberSince: 2022,
      },
      tier: "GOLD",
      points: 2450,
      redeemedRewards: [],

      addPoints: (amount: number) => {
        set((state) => {
          const newPoints = state.points + amount;
          const newTier = determineTier(newPoints);
          return { points: newPoints, tier: newTier };
        });
      },

      redeemReward: (reward: Reward) => {
        const state = get();
        if (state.points >= reward.pointsCost) {
          set((s) => ({
            points: s.points - reward.pointsCost,
            redeemedRewards: [...s.redeemedRewards, reward],
          }));
          return true; // success
        }
        return false; // insufficient points
      },

      updateProfile: (profileUpdates) => {
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates },
        }));
      },

      getPointsToNextTier: () => {
        const state = get();
        if (state.tier === "PLATINUM") {
          return { nextTier: null, pointsNeeded: 0, progress: 100 };
        }
        
        let nextTier: MembershipTier = "SILVER";
        let nextThreshold = TIER_THRESHOLDS.SILVER;
        let currentThreshold = TIER_THRESHOLDS.BRONZE;

        if (state.tier === "SILVER") {
          nextTier = "GOLD";
          nextThreshold = TIER_THRESHOLDS.GOLD;
          currentThreshold = TIER_THRESHOLDS.SILVER;
        } else if (state.tier === "GOLD") {
          nextTier = "PLATINUM";
          nextThreshold = TIER_THRESHOLDS.PLATINUM;
          currentThreshold = TIER_THRESHOLDS.GOLD;
        }

        const pointsNeeded = Math.max(0, nextThreshold - state.points);
        const progress = Math.min(
          100,
          Math.max(0, ((state.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
        );

        return { nextTier, pointsNeeded, progress };
      },
    }),
    {
      name: "cnb-user-store",
    }
  )
);
