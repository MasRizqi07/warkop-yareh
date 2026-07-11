import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

export function UpcomingEvents() {
  return (
    <div className="rounded-xl p-6 border border-[var(--border-default)] bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] h-full">
      <div className="mb-6">
        <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">Community Events</h3>
        <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Active meetups & workshops</p>
      </div>
      
      <div className="space-y-6">
        {/* Event 1 */}
        <div className="flex gap-4 group motion-safe:card-hover">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex flex-col items-center justify-center text-[var(--text-brand)] border border-[var(--color-primary)]/20 shrink-0">
            <span className="font-mono text-[9px] font-bold">OCT</span>
            <span className="font-heading text-lg font-bold leading-none">24</span>
          </div>
          <div className="flex-grow">
            <Link href="/events/e1">
              <h4 className="font-heading text-sm font-bold text-[var(--text-primary)] hover:text-[var(--text-brand)] transition-colors leading-tight">Surabaya Dev Meetup</h4>
            </Link>
            <p className="font-sans text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3 h-3" />
              Co-working Space A
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                <Image className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl26XSuuyhDUe1FmmBqXDsn8yB1NPM_NuBbf8unB0Ya7IvGTFtZlUthhiScBdfAbY1fEuDFms2fAaVmjHD-KD-HkjCXcu5hmY8I28djzc4aKr47YltZVXnxK14jWVgtyBfRAfvgBTjm3Vr-ToD88y5CisvjYi-JTrf8J2Eq0RZZsK2hUX2zAe0v9s1lZZmtGvJy95t-1loHRE-KnV8matnOQybbCUdyB9wpV1uSGmP4tTxTt6z7lD3-qiVrGFHHE5iegIaqHedw34" alt="user" width={24} height={24} />
                <Image className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_h8VmKY9lQWevgqLllZdHZof6dtzUZuu0MiI42hqSpR-IIPLeoG5NEpmQ9mdjapdgIHgAhLTzT12yq28kEQMyrJdM9mS4c7d_cRCFhQV2DMdgbeNv0YfiH-jW3t20ynvvENEPIRO1MdfhNbN_S2_ccQmrovCQMxoSAk7aeGzHzPBRNq0EsJNcHYAKvFAFFiO0bf7wtj0Zkhei_15pXIC_2g2ImAmvXAxkzdeHzUy6SkbZ0pJreNWCmOoas3vss5OcmzYUbrpwjE4" alt="user" width={24} height={24} />
                <div className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] bg-[var(--surface-secondary)] flex items-center justify-center text-[8px] font-bold text-[var(--text-secondary)]">+42</div>
              </div>
              <Link href="/events/e1">
                <button className="font-mono text-[10px] font-bold text-[var(--text-brand)] px-3 py-1.5 rounded-lg border border-[var(--border-brand)] hover:bg-[var(--color-primary)]/10 transition-colors uppercase tracking-wider">Manage</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Event 2 */}
        <div className="flex gap-4 group pt-6 border-t border-[var(--border-default)] motion-safe:card-hover">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 flex flex-col items-center justify-center text-[var(--color-accent)] border border-[var(--color-accent)]/20 shrink-0">
            <span className="font-mono text-[9px] font-bold">OCT</span>
            <span className="font-heading text-lg font-bold leading-none">28</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-heading text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-accent)] transition-colors leading-tight">Latte Art Workshop</h4>
            <p className="font-sans text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3 h-3" />
              Brewing Station
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                <Image className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnATV-DdX50Uxs3AjrERAel1KR72qgEAraCezvhHV-XoAY6JdUvWFl1Z-rhcMzQ9i2tFuLkJSWWdoe3pT18S0-sw40bzKQA4nqlU9-EOFlVujn3hcKc7qdqMfx9RClLHO3kJpX77flM1TIBXlQ91x32jj6i_cR715kC1h8fo-gCPC5uyI2lrBkgiiHeMDlwCb0-mUuDJPfJe2IY_v5g4VK5I2Aulp2mp8hicVrDd9NT4gSqiu8NPvDZw4NJjFpwpwHtIKRlA4Ez4Q" alt="user" width={24} height={24} />
                <Image className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpSmb3IoXR_aSSUExh8JKHfJh1B92Ajers5aNzuldD2qmxQ8OvuhMDmdt_eJQLZ-pZ4QyePHUdbCTxpRGmUyx5jPXVwexCRodUnZvtSfDqMyUMyYsuMByIQ0mkzUEGydiYH2GcexdUQ9DfP5rxt_69e_WfmsiOgi2Md8S1RBE-l9ApA3OKWQLN8yXK6Ii4NAq6ONTOKO8SkGGJwWMuTw8ymu4x4q9YtOhrkSSCcp3tEKgbTiKIHDa0_-mcnDxbGiHfCUt2WwZetRE" alt="user" width={24} height={24} />
                <div className="w-6 h-6 rounded-full border-2 border-[var(--surface-tertiary)] bg-[var(--surface-secondary)] flex items-center justify-center text-[8px] font-bold text-[var(--text-secondary)]">+12</div>
              </div>
              <button className="font-mono text-[10px] font-bold text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] px-3 py-1.5 rounded-lg border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 transition-colors uppercase tracking-wider">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
