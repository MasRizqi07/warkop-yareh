"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { 
  IconSearch, 
  IconGroups, 
  IconActive, 
  IconUserAdd, 
  IconLoyalty, 
  IconView, 
  IconEdit, 
  IconChevronLeft, 
  IconChevronRight 
} from "@/lib/icons";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  joinDate: string;
  lastActive: string;
  status: "Active" | "Inactive";
}

export default function UsersDirectory() {
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [members, setMembers] = useState<Member[]>([
    {
      id: "M-IND-01",
      name: "Indra Wijaya",
      email: "indra.w@techmail.id",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDc0rXlN0VitJnMtXDp2wEYWKI7Pz2lK4n4t04E0Di_eg66Nw7vV6c5unXILXHIcA-g6r975bVIUE926vBkkc2mXuhbdPicxw-CrNLo4R6pQ57ie6nrojiJzb9JZ2W3O3_KOKj8ih3wkQMfmeKyl0CqxMIpDsrn2yntaIEUDl8Ls4Fzr3zTIAWR_AToT52Hyv35kUuGIwXoiYBmkeluRMiYuQUAvXKVvw4HsgcyQwR9wmpSMvQFmGrOn3mtt84L21qp93qGZsaGuvk",
      tier: "Gold",
      points: 4820,
      joinDate: "12/04/2023",
      lastActive: "2 HOURS AGO",
      status: "Active",
    },
    {
      id: "M-SIT-02",
      name: "Siti Rahma",
      email: "siti.rahma@devhouse.com",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA_41Im8hMuz5f8nG4PWn-VPlomADNCBJnXx31x4yOc4kgpLRbggPspMBXNzPEx39FVk0qyELwGV3Chhj5BBxuXaDEjb5m82iMUejs30i0opupjfYaTs4C2wXG43SxqMCirVtbIHg5JKKGxwKARxYfdwR-rSXdlxRfYW0CklHUD0VrfgyfiywgrcephcAWcngTldZZdwhLQlxsMqLV_i9UJ3EPKKi8jAmfipdT-CwSU4CytlcIJwYRTty-y2lxqYC8inVoFsa55hU",
      tier: "Silver",
      points: 1250,
      joinDate: "05/01/2024",
      lastActive: "1 DAY AGO",
      status: "Active",
    },
    {
      id: "M-BUD-03",
      name: "Budi Hartono",
      email: "b.hartono@platinum.io",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARxv5c5CZ5yUlkruY7vI7yFPLfzazmZw1GGpSnO7AT5JIi_LB4VOxEiBslj_9EqmnA0ZbqsUT252VS5jYt4aWfbSxLnx7Mss6Oz9sEDo0YCvPHEs_eYAyS_nO5gl3m5vSDJ0mO3SySDwK8caaJlGXBR4vU-bnr-sja9I_3v366MoPhNHw-0pzx0-Hfy5o_A4ZQd_8Tpxj2aAX9lcwR_J3-Umgu6tEmm4f6HcMavYxIIgIWC4NyI7ZMDvdHpgjtRCHnMtfDoQLFExc",
      tier: "Platinum",
      points: 12400,
      joinDate: "18/11/2022",
      lastActive: "3 DAYS AGO",
      status: "Inactive",
    },
    {
      id: "M-MAY-04",
      name: "Maya Putri",
      email: "maya.p@startup.com",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB557oYviOrGzfZ4JFVyNNMqIGeU8s6c6_Siy2nokybL_7dw3cxSFzMMHyGeTKTDy-5XTM6hPbPr_RbQRRrekbu8O5JoGGWxbw8yyZ8Bz2zeqg86PoIW6OY0wlBKv7Hj1aPezWCqJyIyF0t--Bo0B6zyyVTgSkxnguR06EpWuYGoKpcJXKz1AgoIAeFs6XrEuYUhJhVcbqKGhoMxxzIaer19w99tvDTX7NPSKRxLoAAdXZWf2Ai4NVWDLkeW3nYLX8QYVMKY-ssbR8",
      tier: "Bronze",
      points: 340,
      joinDate: "22/02/2024",
      lastActive: "5 MINS AGO",
      status: "Active",
    },
  ]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        member.id.toLowerCase().includes(search.toLowerCase());

      const matchTier = selectedTier === "All" || member.tier === selectedTier;
      const matchStatus = selectedStatus === "All" || member.status === selectedStatus;

      return matchSearch && matchTier && matchStatus;
    });
  }, [search, selectedTier, selectedStatus, members]);

  const handleEditPoints = (id: string, currentPoints: number) => {
    const val = prompt(`Edit points balance (current: ${currentPoints}):`, currentPoints.toString());
    if (val !== null && !isNaN(Number(val))) {
      setMembers(
        members.map((m) => (m.id === id ? { ...m, points: Number(val) } : m))
      );
    }
  };

  const handleCheckIn = () => {
    const name = prompt("Enter new member name:");
    if (!name) return;
    const email = prompt("Enter email address:");
    if (!email) return;

    const tiers: Array<"Bronze" | "Silver" | "Gold" | "Platinum"> = ["Bronze", "Silver", "Gold", "Platinum"];
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];

    const newMember: Member = {
      id: `M-NEW-0${members.length + 1}`,
      name,
      email,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl26XSuuyhDUe1FmmBqXDsn8yB1NPM_NuBbf8unB0Ya7IvGTFtZlUthhiScBdfAbY1fEuDFms2fAaVmjHD-KD-HkjCXcu5hmY8I28djzc4aKr47YltZVXnxK14jWVgtyBfRAfvgBTjm3Vr-ToD88y5CisvjYi-JTrf8J2Eq0RZZsK2hUX2zAe0v9s1lZZmtGvJy95t-1loHRE-KnV8matnOQybbCUdyB9wpV1uSGmP4tTxTt6z7lD3-qiVrGFHHE5iegIaqHedw34",
      tier: randomTier,
      points: 100,
      joinDate: new Date().toLocaleDateString("id-ID"),
      lastActive: "JUST NOW",
      status: "Active",
    };

    setMembers([...members, newMember]);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">User Directory</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Manage members, check-ins, and loyalty points balances</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] opacity-75" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 w-64 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all"
              placeholder="Search members by name or ID..."
              type="text"
            />
          </div>
          <button
            onClick={handleCheckIn}
            className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:shadow-lg active:scale-95"
          >
            Check In
          </button>
        </div>
      </div>

      {/* Stats Badges row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card bg-[var(--surface-tertiary)] p-6 rounded-2xl border border-[var(--border-default)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
              <IconGroups size={24} />
            </div>
            <span className="text-[var(--success-500)] text-xs font-bold font-mono">+12%</span>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-mono tracking-widest">Total Members</p>
          <h3 className="font-heading text-3xl font-bold mt-1 text-[var(--text-primary)]">1,284</h3>
        </div>
        <div className="glass-card bg-[var(--surface-tertiary)] p-6 rounded-2xl border border-[var(--border-default)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-xl text-[var(--color-accent)]">
              <IconActive size={24} />
            </div>
            <span className="text-[var(--success-500)] text-xs font-bold font-mono">Active</span>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-mono tracking-widest">Active Today</p>
          <h3 className="font-heading text-3xl font-bold mt-1 text-[var(--text-primary)]">412</h3>
        </div>
        <div className="glass-card bg-[var(--surface-tertiary)] p-6 rounded-2xl border border-[var(--border-default)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
              <IconUserAdd size={24} />
            </div>
            <span className="text-[var(--text-secondary)] text-xs font-semibold font-mono">New</span>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-mono tracking-widest">New This Week</p>
          <h3 className="font-heading text-3xl font-bold mt-1 text-[var(--text-primary)]">64</h3>
        </div>
        <div className="glass-card bg-[var(--surface-tertiary)] p-6 rounded-2xl border border-[var(--border-default)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
              <IconLoyalty size={24} />
            </div>
            <span className="text-[var(--color-accent)] text-xs font-semibold font-mono">Gold Avg</span>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-mono tracking-widest">Avg Points</p>
          <h3 className="font-heading text-3xl font-bold mt-1 text-[var(--text-primary)]">2,450</h3>
        </div>
      </section>

      {/* Filters Select blocks */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-[var(--surface-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs rounded-xl px-4 py-2 outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-primary)]"
            title="Filter by Membership Tier"
            aria-label="Filter by Membership Tier"
          >
            <option value="All">All Membership Tiers</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[var(--surface-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs rounded-xl px-4 py-2 outline-none cursor-pointer focus:ring-1 focus:ring-[var(--color-primary)]"
            title="Filter by Status"
            aria-label="Filter by Status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="text-xs font-mono text-[var(--text-secondary)]">
          Showing <span className="text-[var(--color-primary)] font-bold">{filteredMembers.length}</span> members
        </div>
      </section>

      {/* Roster Table */}
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--surface-secondary)]/50 border-b border-[var(--border-default)] font-mono">
            <tr>
              <th className="px-8 py-5 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold">User Entity</th>
              <th className="px-6 py-5 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold">Tier</th>
              <th className="px-6 py-5 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold">Balance</th>
              <th className="px-6 py-5 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold text-center">Join Date</th>
              <th className="px-6 py-5 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]/50 text-xs font-medium">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-[var(--surface-secondary)]/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        className="w-11 h-11 rounded-2xl object-cover transition-all duration-500"
                        src={member.avatar}
                        alt={member.name}
                        width={44}
                        height={44}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[var(--surface-tertiary)] rounded-full ${
                        member.status === "Active" ? "bg-[var(--success-500)]" : "bg-neutral-500"
                      }`}></span>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{member.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] font-mono font-semibold mt-0.5">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    member.tier === "Platinum"
                      ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                      : member.tier === "Gold"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm shadow-amber-500/10"
                      : member.tier === "Silver"
                      ? "bg-neutral-600 text-white"
                      : "bg-[#825426]/30 text-[#f7bb82]"
                  }`}>
                    {member.tier}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-mono text-[var(--color-primary)] text-base font-bold">{member.points.toLocaleString("id-ID")}</span>
                  <span className="text-[9px] font-mono text-[var(--text-tertiary)] opacity-50 ml-1">PTS</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <p className="font-mono font-semibold text-[var(--text-primary)]">{member.joinDate}</p>
                  <p className="text-[9px] font-mono text-[var(--text-tertiary)] opacity-40 mt-1 uppercase font-semibold">{member.lastActive}</p>
                </td>
                <td className="px-6 py-5 text-right space-x-1">
                  <button
                    onClick={() => alert(`Viewing details for ${member.name}...`)}
                    className="p-1.5 hover:bg-[var(--surface-secondary)] rounded-lg text-[var(--color-primary)] transition-all active:scale-90"
                    title="View Profile"
                  >
                    <IconView size={16} />
                  </button>
                  <button
                    onClick={() => handleEditPoints(member.id, member.points)}
                    className="p-1.5 hover:bg-[var(--surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-90"
                    title="Edit Points"
                  >
                    <IconEdit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer block */}
        <div className="px-8 py-5 flex items-center justify-between bg-[var(--surface-secondary)]/30 border-t border-[var(--border-default)] font-mono text-[10px]">
          <p className="text-[var(--text-secondary)] font-semibold">Showing {filteredMembers.length} of 1,284 members</p>
          <div className="flex gap-1">
            <button title="Previous Page" aria-label="Previous Page" className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <IconChevronLeft size={12} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">2</button>
            <button title="Next Page" aria-label="Next Page" className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <IconChevronRight size={12} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
