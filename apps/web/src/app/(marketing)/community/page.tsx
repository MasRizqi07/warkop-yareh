"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  IconSchedule, 
  IconChevronRight, 
  IconLike, 
  IconComment, 
  IconShare 
} from "@/lib/icons";

interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  actionText: string;
  isRegistered: boolean;
  pulse?: boolean;
  dateBg: string;
  dateText: string;
  btnStyle: string;
}

interface PostItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  timeAgo: string;
  content: string;
  quote?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function CommunityPage() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "ev1",
      title: "Jakarta Dev Meetup #42",
      description: "Deep dive into Micro-interactions and Framer Motion with the local React community.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3cQNDVWLj_cT3txxifaPrCIWzVAUUYrTiVjdr-wXGQpAs1PYe8SSH-ygr1F6CqvYO6hMujsROHNZNgh2wffdbQ2HxTRg0N_1ds9DS-6h4ejv5Vj_Ha5soMY2M3QcdDiYkvpAGNWKhXVbNB2jeftsxXJPcbkZ_7vLA7dRvgjqsuCc2o-4uLmtuoDyDEZoLwugDdl--4ibTTGC_Vok4pzYYCddVWhoXZ1sly7_MumLSdB9jjYiJexbQ6ekytbZT09fkRzXcidQGP74",
      date: "JUL 12",
      time: "19:00 WIB",
      actionText: "REGISTER",
      isRegistered: false,
      pulse: true,
      dateBg: "bg-primary-container",
      dateText: "text-on-primary-container",
      btnStyle: "bg-primary hover:bg-primary-fixed-dim text-on-primary px-6 py-2 rounded-lg font-receipt-label text-receipt-label transition-all active:scale-95 animate-pulse-glow"
    },
    {
      id: "ev2",
      title: "Acoustic Midnight Soul",
      description: "Unwind with soulful melodies and our signature single-origin espresso flight.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDscWwEVuZ5BNb8cyS9dLU4baN6potrYbuoVURIfNe3d6XP1VjbAh7HdZ-f8oKmSNoXN9F2nCqFriosFc3tRtZOIVKHFNa9ajJMKdAhPoV2g1glKQdGq1gQTvauqBeKBKjSOAHf8O2-zSB_5b2H2qgYfZzfpv6TBXyIsOyBuS-bNus2VyrnReaaEwaefYrkk5gTt43CZhkH0cogEXA63S11vf9DVWIHknbAi-bp882nOC3TpUbEPTHTbQUFOSjQ7_eO2p23hoDEX3w",
      date: "JUL 15",
      time: "21:00 WIB",
      actionText: "BOOK SPOT",
      isRegistered: false,
      dateBg: "bg-tertiary-container",
      dateText: "text-on-tertiary-container",
      btnStyle: "bg-surface-variant border border-primary text-primary hover:bg-primary/10 px-6 py-2 rounded-lg font-receipt-label text-receipt-label transition-all active:scale-95"
    },
    {
      id: "ev3",
      title: "Writer Guild: Pitch Day",
      description: "Share your work-in-progress and get constructive feedback from fellow storytellers.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2b5NNIlzhOZraVh5fajeC5p2miv0cZH_OEAIfZrQUXNZh-iHlRG6yg_TRIVZ-hPyH24ZpfB-qRu-MDbqu6TMDOikZju82lruCEgfJIZ0aWc8rjuxpMvMG2k50yv9Vcc-slpDct_mI2RRk1bU8qH0lCUK5lLIvinMScoPy8bqjQeK9Xac-hK-zbR_5gw6QCoZ7pBXBbXBraZmpHPwluSFNG8F_4NTvE9LMrelcB23CeROarncD_rplx0wucstdoAybPDYynKZ-fXU",
      date: "JUL 18",
      time: "14:00 WIB",
      actionText: "JOIN WAITLIST",
      isRegistered: false,
      dateBg: "bg-secondary-container",
      dateText: "text-on-secondary-container",
      btnStyle: "bg-surface-variant border border-primary text-primary hover:bg-primary/10 px-6 py-2 rounded-lg font-receipt-label text-receipt-label transition-all active:scale-95"
    },
  ]);

  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: "post1",
      name: "Arya Saloka",
      role: "Senior Frontend Eng @ WarkopTech",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq6cTryqvkuKgZ0lkmA_xFa1WF_B1vRgMYChynAqbbTWrO5osTuHP9xRur-AM1i_hKaKS_zd9ALi6whNaf2_E_LCh4g-yIl7rC4UTGyeVQfFN6rGGf-DklIddLamqgW1XpIAgC_EMmWSwE_Ivf4fwzIC4m3jFg-QOSUnzcJ5gLf7lTUTujZfSr9_iuv6zNvSPIKxRsGh9VbC-ZiBjkPq7f-A1ZWMsMg3jVFwoitI7CB0rG9VTeiUcQ_w7lPb4DA6qieQmXBsTGVrw",
      timeAgo: "2h ago",
      content: "Just pushed a new PR for the open-source coffee inventory tracker. Any Java gurus here can help review the garbage collection optimizations? Meet me at table 0xA for a manual brew and code review session! ☕️💻",
      likes: 24,
      comments: 8,
      isLiked: false,
    },
    {
      id: "post2",
      name: "Maya Putri",
      role: "UX Researcher",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDJkuFCvpA0KpSa3QTSWP-ClNIpjXIT-1jDFefJDKOlMER5q86Sds5JZDD8iTzJBtQdXcnfEfGosdwHyLGzd8a-BOxqKqHtG8DofhPfZJAXnLKjM-JWI0TdGDTM-9CBldreFha6ZyPCHQtWtUTj60OrjmyuXQTT4FIFUYR8eUzgfcCMEM8M-70RfPi2lSrkaPhtqmjML79B9doQjofhALOOLwz2ms3hQhExdKUYmeFKlqfiO-yfHey5WY_EcZ687V8HgP2R_sDJ68",
      timeAgo: "5h ago",
      content: "What's your favorite coding music? I'm torn between Lofi Chill and 80s Synthwave. Looking for something that pairs well with an Iced Gula Aren Latte.",
      quote: "\"Synthwave for the crunch, Lofi for the docs.\" - Anonymous Dev",
      likes: 42,
      comments: 15,
      isLiked: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("LATEST");
  const [newPostContent, setNewPostContent] = useState("");
  const [rsvpEvent, setRsvpEvent] = useState<EventItem | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      name: "You (Member)",
      role: "Digital Nomad @ Cold 'N Brew",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq6cTryqvkuKgZ0lkmA_xFa1WF_B1vRgMYChynAqbbTWrO5osTuHP9xRur-AM1i_hKaKS_zd9ALi6whNaf2_E_LCh4g-yIl7rC4UTGyeVQfFN6rGGf-DklIddLamqgW1XpIAgC_EMmWSwE_Ivf4fwzIC4m3jFg-QOSUnzcJ5gLf7lTUTujZfSr9_iuv6zNvSPIKxRsGh9VbC-ZiBjkPq7f-A1ZWMsMg3jVFwoitI7CB0rG9VTeiUcQ_w7lPb4DA6qieQmXBsTGVrw",
      timeAgo: "Just now",
      content: newPostContent,
      likes: 1,
      comments: 0,
      isLiked: true,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const handleEventAction = (id: string) => {
    setEvents(
      events.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              isRegistered: !ev.isRegistered,
              actionText: ev.isRegistered ? "REGISTER" : "REGISTERED",
            }
          : ev
      )
    );
  };

  const handleLike = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleEventClick = (ev: EventItem) => {
    setRsvpEvent(ev);
    handleEventAction(ev.id);
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <div className="fixed inset-0 organic-noise z-0"></div>
      <main className="relative z-10 pt-24 pb-32 px-margin-mobile max-w-container-max mx-auto">
        {/* Hero Section: Identity */}
        <section className="mb-12">
          <p className="font-receipt-label text-receipt-label text-secondary uppercase tracking-[0.2em] mb-2">Central Node</p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">Community Hub</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
        </section>

        {/* Upcoming Events Carousel */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Events</h3>
            <a className="font-receipt-label text-receipt-label text-primary-fixed hover:underline" href="#">VIEW ALL</a>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 custom-scroll snap-x">
            {events.map((ev) => (
              <div key={ev.id} className="flex-shrink-0 w-80 md:w-96 snap-start">
                <div 
                  onClick={() => handleEventClick(ev)}
                  className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={ev.image}
                      alt={ev.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />
                    <div className={`absolute top-4 left-4 ${ev.dateBg} px-3 py-1 rounded-full`}>
                      <span className={`font-receipt-label text-receipt-label ${ev.dateText}`}>{ev.date}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{ev.title}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">{ev.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <IconSchedule size={14} className="text-primary" />
                        <span className="font-receipt-label text-receipt-label text-on-surface-variant/80">{ev.time}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(ev);
                        }}
                        className={ev.btnStyle}
                      >
                        {ev.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid: Groups & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Community Groups (Left Col) */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Verified Guilds</h3>
            <div className="space-y-4">
              {[
                { name: "Developer Club", count: "1.2k Members", letter: "D", bg: "bg-primary-container", text: "text-on-primary-container" },
                { name: "Writers Guild", count: "840 Members", letter: "W", bg: "bg-tertiary-container", text: "text-on-tertiary-container" },
                { name: "Game Design Collective", count: "450 Members", letter: "G", bg: "bg-secondary-container", text: "text-on-secondary-container" }
              ].map((guild) => (
                <div key={guild.name} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${guild.bg} flex items-center justify-center ${guild.text} font-bold text-xl`}>
                      {guild.letter}
                    </div>
                    <div>
                      <h5 className="font-body-lg text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {guild.name}
                      </h5>
                      <p className="font-receipt-label text-receipt-label text-on-surface-variant/60">{guild.count}</p>
                    </div>
                  </div>
                  <IconChevronRight size={24} className="text-primary-fixed" />
                </div>
              ))}
            </div>
            <button className="w-full py-4 border border-dashed border-outline-variant rounded-xl text-on-surface-variant font-receipt-label text-receipt-label hover:border-primary hover:text-primary transition-all">
              + EXPLORE ALL GUILDS
            </button>
          </div>

          {/* Discussion Feed (Right Col) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Latest Discussions</h3>
              <div className="flex gap-2">
                {["LATEST", "TRENDING"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={
                      activeTab === tab
                        ? "font-receipt-label text-receipt-label px-3 py-1 bg-primary text-on-primary rounded-full"
                        : "font-receipt-label text-receipt-label px-3 py-1 text-on-surface-variant hover:bg-white/5 rounded-full"
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Creation Box */}
            <form onSubmit={handleCreatePost} className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Bagikan ide, cari teman coding, atau tawarkan review PR di meja warkop..."
                rows={2}
                className="w-full bg-surface-container rounded-xl p-3.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant/60">Tekan Kirim untuk berbagi dengan member lain</span>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md disabled:opacity-40 disabled:pointer-events-none hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Kirim Post
                </button>
              </div>
            </form>

            {/* Feed Items */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/20 relative overflow-hidden flex-shrink-0">
                      <Image
                        alt="User avatar"
                        className="object-cover"
                        src={post.avatar}
                        fill
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-body-lg text-body-lg font-bold text-on-surface">{post.name}</h5>
                          <p className="font-code-sm text-code-sm text-primary-fixed/60 mb-3">{post.role}</p>
                        </div>
                        <span className="font-receipt-label text-receipt-label text-on-surface-variant/50">{post.timeAgo}</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                        {post.content}
                      </p>
                      {post.quote && (
                        <div className="mb-6 p-4 bg-surface-container rounded-xl border-l-4 border-primary italic text-on-surface-variant/80 font-body-md">
                          {post.quote}
                        </div>
                      )}
                      <div className="flex gap-6 items-center">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 group/btn cursor-pointer">
                          <IconLike size={20} className={`text-on-surface-variant group-hover/btn:text-primary transition-colors ${post.isLiked ? 'fill-primary text-primary' : ''}`} />
                          <span className={`font-receipt-label text-receipt-label ${post.isLiked ? 'text-primary' : 'text-on-surface-variant'}`}>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 group/btn cursor-pointer">
                          <IconComment size={20} className="text-on-surface-variant group-hover/btn:text-primary transition-colors" />
                          <span className="font-receipt-label text-receipt-label text-on-surface-variant">{post.comments}</span>
                        </button>
                        {!post.quote && (
                          <button title="Share post" aria-label="Share post" className="flex items-center gap-2 group/btn cursor-pointer">
                            <IconShare size={20} className="text-on-surface-variant group-hover/btn:text-primary transition-colors" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Event RSVP Ticket Pass Modal */}
      {rsvpEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRsvpEvent(null)} />
          <div className="relative w-full max-w-sm bg-surface-container border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-on-surface space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Event Pass Confirmed</span>
              <h3 className="font-headline-md text-lg font-bold">{rsvpEvent.title}</h3>
              <p className="text-xs text-on-surface-variant">{rsvpEvent.date} • {rsvpEvent.time}</p>
            </div>
            
            <div className="p-4 bg-background rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center gap-2">
              <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center text-black font-mono text-xs font-bold shadow-sm">
                [QR CODE PASS]
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">PASS-TOKEN: YAREH-{rsvpEvent.id.toUpperCase()}-774</span>
            </div>

            <button
              onClick={() => setRsvpEvent(null)}
              className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              Simpan Pass ke Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
