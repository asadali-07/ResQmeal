import { NavLink } from "react-router-dom";
import { HandHeart, MapPinned, Store, Truck } from "lucide-react";

const roleCards = [
    {
        title: "Restaurant",
        description: "List surplus food with pickup windows and reach nearby NGOs fast.",
        icon: Store,
        accent: "bg-[var(--accent)]",
        to: "/restaurant",
    },
    {
        title: "NGO",
        description: "Browse available meals on the map and claim them in a few taps.",
        icon: HandHeart,
        accent: "bg-[var(--accent-2)]",
        to: "/ngo",
    },
    {
        title: "Volunteer",
        description: "Accept pickups, verify tokens, and deliver meals with live tracking.",
        icon: Truck,
        accent: "bg-[var(--accent-3)]",
        to: "/volunteer",
    },
];

const Home = () => {
    return (
        <div className="space-y-12">
            <section className="glass-panel grid-fade rounded-3xl border border-white/70 px-6 py-12 md:px-12">
                <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-(--muted)">
                            Map-based rescue flow
                        </p>
                        <h1 className="mt-4 text-4xl md:text-5xl">
                            Rescue surplus food in real-time.
                        </h1>
                        <p className="mt-4 text-base text-(--muted) md:text-lg">
                            ResQmeal connects restaurants, NGOs, and volunteers to turn leftover
                            meals into delivered nourishment. See live pickup zones, claim in a
                            moment, and coordinate delivery with verified tokens.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <NavLink
                                to="/register"
                                className="rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                            >
                                Start as a partner
                            </NavLink>
                            <NavLink
                                to="/ngo"
                                className="rounded-full border border-(--accent-2) px-5 py-3 text-sm font-semibold text-(--accent-2)"
                            >
                                View live map
                            </NavLink>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/70 bg-white/70 p-6">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--accent-2) text-white">
                                <MapPinned className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-display text-lg">Live pickup pulse</p>
                                <p className="text-sm text-(--muted)">
                                    Track activity near your community.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4 text-sm text-(--muted)">
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Open listings</span>
                                <span className="font-semibold text-(--ink)">Live map</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Claims in motion</span>
                                <span className="font-semibold text-(--ink)">Token verified</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Volunteer routes</span>
                                <span className="font-semibold text-(--ink)">Real-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
                {roleCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <NavLink
                            key={card.title}
                            to={card.to}
                            className="glass-panel rounded-3xl border border-white/70 p-6 transition hover:-translate-y-1"
                        >
                            <div className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${card.accent}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-5 font-display text-xl">{card.title}</h3>
                            <p className="mt-3 text-sm text-(--muted)">{card.description}</p>
                            <p className="mt-4 text-sm font-semibold text-(--ink)">
                                Enter {card.title} flow 
                            </p>
                        </NavLink>
                    );
                })}
            </section>
        </div>
    );
};

export default Home;
