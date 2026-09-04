"use client";

import React from "react";
import Image from "next/image";
import { 
  IconLoyalty, 
  IconCoffee, 
  IconSeat, 
  IconGroups, 
  IconArrowRight, 
  IconTrending, 
  IconTerminal 
} from "@/lib/icons";
import { useUserStore, Reward } from "@/stores";
import { api } from "@/lib/api";

export default function LoyaltyPage() {
  const { profile, tier, points, getPointsToNextTier } = useUserStore();
  const { nextTier, pointsNeeded, progress } = getPointsToNextTier();

  const [rewards, setRewards] = React.useState<Reward[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = React.useState(points);
  const [loyaltyTier, setLoyaltyTier] = React.useState(tier);

  React.useEffect(() => {
    // Fetch user loyalty status
    api.get('/loyalty/user-1').then(res => {
      if (res.data?.data) {
        setLoyaltyPoints(res.data.data.points);
        setLoyaltyTier(res.data.data.tier);
      }
    }).catch(console.error);

    // Fetch available rewards
    api.get('/loyalty/rewards').then(res => {
      if (res.data?.data) {
        setRewards(res.data.data);
      }
    }).catch(console.error);
  }, []);

  const handleRedeem = async (cost: number, name: string, id: string) => {
    try {
      if (loyaltyPoints < cost) {
        alert(`Insufficient points! You need ${cost} points.`);
        return;
      }
      await api.post('/loyalty/redeem', { userId: 'user-1', rewardId: id });
      setLoyaltyPoints(prev => prev - cost);
      alert(`Successfully redeemed: ${name}`);
    } catch (err) {
      console.error(err);
      alert('Failed to redeem reward');
    }
  };
  return (
    <div className="bg-background text-on-background min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 organic-noise z-[-1]"></div>

      <main className="pt-24 pb-32 px-margin-mobile max-w-container-max mx-auto space-y-8">
        {/* Hero: Loyalty & Greeting */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Halo, {profile.name.split(" ")[0]}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-gradient-to-r from-[var(--gold-highlight)] to-[var(--accent-fill)] text-[var(--text-on-brand)] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shimmer">
                  {loyaltyTier} Member
                </span>
                <span className="font-receipt-label text-receipt-label text-on-surface-variant/60">EST. {profile.memberSince}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-receipt-label text-receipt-label text-primary uppercase tracking-tighter">Current Balance</p>
              <div className="flex items-center justify-end gap-2 group cursor-pointer">
                <span className="font-display-lg text-headline-md text-primary-fixed leading-none">{loyaltyPoints.toLocaleString()}</span>
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center animate-pulse-glow">
                  <IconLoyalty size={18} className="text-on-primary-container" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {nextTier && (
            <div className="glass-card p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="text-on-surface-variant font-receipt-label uppercase">Progress to {nextTier}</span>
                <span className="text-primary font-code-sm">{pointsNeeded.toLocaleString()} pts needed</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Dashboard Bento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card col-span-2 p-6 rounded-xl flex items-center justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500">
              <div className="z-10">
                <p className="font-receipt-label text-receipt-label text-on-surface-variant mb-1">CURRENTLY BREWING</p>
                <h3 className="font-headline-md text-headline-md text-on-surface">Darmo Flagship</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-java-green animate-pulse"></div>
                  <span className="text-sm font-receipt-label text-java-green">OPEN UNTIL 02:00 AM</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                <IconCoffee size={120} />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center gap-3 p-4 glass-card rounded-xl hover:bg-primary-container/20 group transition-all duration-300 active:scale-95">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <IconCoffee size={24} />
            </div>
            <span className="font-receipt-label text-[10px] uppercase tracking-wider text-on-surface-variant">Order Now</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-4 glass-card rounded-xl hover:bg-primary-container/20 group transition-all duration-300 active:scale-95">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <IconSeat size={24} />
            </div>
            <span className="font-receipt-label text-[10px] uppercase tracking-wider text-on-surface-variant">Book Table</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-4 glass-card rounded-xl hover:bg-primary-container/20 group transition-all duration-300 active:scale-95">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <IconGroups size={24} />
            </div>
            <span className="font-receipt-label text-[10px] uppercase tracking-wider text-on-surface-variant">Join Event</span>
          </button>
        </section>

        {/* Recommended Scroll */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Specialty Picks</h3>
            <a className="font-receipt-label text-receipt-label text-primary flex items-center gap-1" href="#">
              SEE ALL <IconArrowRight size={14} />
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-margin-mobile px-margin-mobile">
            {rewards.map(reward => (
              <div key={reward.id} className="min-w-[200px] max-w-[200px] glass-card rounded-xl overflow-hidden group flex flex-col">
                {reward.image && (
                  <div className="h-40 w-full overflow-hidden relative shrink-0">
                    <Image 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      src={reward.image}
                      alt={reward.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />
                  </div>
                )}
                <div className="p-4 space-y-2 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline-md text-body-lg text-on-surface leading-tight">{reward.name}</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 flex-grow">{reward.description}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <IconTrending size={14} className="text-primary" />
                      <span className="font-receipt-label text-[10px] text-on-surface-variant/60">{reward.category}</span>
                    </div>
                    <button onClick={() => handleRedeem(reward.pointsCost, reward.name, reward.id)} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-headline-md hover:bg-primary hover:text-coffee-bean transition-colors whitespace-nowrap">
                      {reward.pointsCost} pts
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events / Community Section */}
        <section className="glass-card rounded-2xl p-6 relative overflow-hidden border-dashed border-primary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <IconTerminal size={24} className="text-primary-fixed" />
              <h3 className="font-headline-md text-headline-md text-on-surface">Dev Night #14</h3>
            </div>
            <p className="text-on-surface-variant text-sm">Join our weekly session: &quot;Optimizing Microservices with Rust&quot;. Free coffee for first 20 attendees.</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex -space-x-3">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDRc4TdxA0j-uWt7KUMARARrXnK_VkAeF5QYEQmdruFbkhHDxDG2pjC7g9gs9VaeHUmHwtq_CxfkffBPvueR5GwbTOopUSQBfiRztFJdVPh9HuIB6l9oL3gcGoaRMh0lcav1qsTMGMu7Ut1TzsoyTLN87ZkYaA8cfag6UZW6CN5EeH-9Zf1KkBNiMCvdJghfvIhjvBIqzfnJuFBt6zx_yy-xYPbRoZIuljbWJiAIcBTwX4LqSq-yJCDoGCnu9zunvyWC2gc10ez0MY",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBDB8OH6qlPtYalu1WS6ZvaPc0jUJNKfhaqng9bbkfuSrkd1dGVE_G0Jpj3SAJvoJGv6YhF65I8mSvve1PsQgeoUKqlm5OQS6H5OVVJfJzSZUgmNN7VDdPSgXYRculSb5qbNozatjtvVA0wbR_FxpnRkJNeAOEZU4x8H-20cLUFLlZzi3wLfT4etxBG7wgM2iMReJfm4OurBV4IyL89NpyYkL8CD2bubYyEtOJnB2Vkd2e58c3C68fiCmUTBNRbfMR-F_HBtXldnWI",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbj2YUBNdt2McTkkTI_gAG4unSHmH617HXLs9vnJnj7Mt09ZnmhL6sOqPfU30WoX2X0tIjJJYyj5T6YxKtfIEuL9Qi3yTCrrFb5bBMD6e4iHK0ZhGBw9wM_X2N3GFUHrZ6tDmDDxUEUl_3OZLAW7mrw3EiMI0wSY6f239M1K_3dJWumzBTqqqL2xe9SlYdh9LTArvjn0wpJ9keESDIqWgVdCmoEerpYmYdDClmMRhqhZXmhbqfzybFa1cym5YgNty3AooluEFFKi4"
                ].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden relative">
                    <Image alt="User" className="w-full h-full object-cover" src={src} fill sizes="32px" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
              <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-receipt-label text-receipt-label uppercase tracking-widest active:scale-95 transition-all">RSVP NOW</button>
            </div>
          </div>
          {/* Decorative Dashed Line */}
          <div className="absolute left-0 right-0 bottom-0 h-1 border-b-2 border-dashed border-white/5"></div>
        </section>
      </main>
    </div>
  );
}
