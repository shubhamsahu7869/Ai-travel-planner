import Link from "next/link";

const destinations = [
  {
    name: "Singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
    query: "destination=Singapore&interests=Shopping,Nature,Food",
  },
  {
    name: "Bangkok",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80",
    query: "destination=Bangkok&interests=Food,Culture,Shopping",
  },
  {
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    query: "destination=Tokyo&interests=Culture,Food,Nightlife",
  },
  {
    name: "Kuala Lumpur",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80",
    query: "destination=Kuala Lumpur&interests=Shopping,Food,Culture",
  },
  {
    name: "Paris",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    query: "destination=Paris&interests=Culture,Food,History",
  },
  {
    name: "London",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
    query: "destination=London&interests=History,Culture,Shopping",
  },
  {
    name: "Phuket",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80",
    query: "destination=Phuket&interests=Nature,Relaxation,Adventure",
  },
  {
    name: "Kathmandu",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=900&q=80",
    query: "destination=Kathmandu&interests=History,Culture,Adventure",
  },
];

const topExperiences = [
  {
    rank: 1,
    title: "Universal Studios Singapore",
    image: "https://images.unsplash.com/photo-1623841675698-8c8c29abf78f?auto=format&fit=crop&w=900&q=80",
    query: "destination=Singapore&interests=Adventure,Shopping,Food",
  },
  {
    rank: 2,
    title: "Safari World Bangkok",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=900&q=80",
    query: "destination=Bangkok&interests=Nature,Adventure,Food",
  },
  {
    rank: 3,
    title: "Disneyland Paris",
    image: "https://images.unsplash.com/photo-1590144662036-33bf0ebd2c7f?auto=format&fit=crop&w=900&q=80",
    query: "destination=Paris&interests=Adventure,Food,Shopping",
  },
  {
    rank: 4,
    title: "KL Tower",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80",
    query: "destination=Kuala Lumpur&interests=Culture,Food,Shopping",
  },
];

const activities = [
  {
    title: "Gardens by the Bay",
    price: "from INR 741 per adult",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
    query: "destination=Singapore&interests=Nature,Relaxation",
  },
  {
    title: "Disneyland Paris Parks",
    price: "from INR 6,906 per adult",
    image: "https://images.unsplash.com/photo-1590144662036-33bf0ebd2c7f?auto=format&fit=crop&w=900&q=80",
    query: "destination=Paris&interests=Adventure,Shopping",
  },
  {
    title: "Floating Beach Club",
    price: "from INR 6,036 per adult",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    query: "destination=Phuket&interests=Relaxation,Nature",
  },
  {
    title: "Singapore Flyer",
    price: "from INR 2,751 per adult",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=900&q=80",
    query: "destination=Singapore&interests=Shopping,Nightlife",
  },
  {
    title: "Dubai Marina Yacht Tour",
    price: "from INR 2,923 per adult",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    query: "destination=Dubai&interests=Relaxation,Food,Nightlife",
  },
  {
    title: "Night Safari",
    price: "from INR 4,299 per adult",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=80",
    query: "destination=Singapore&interests=Nature,Adventure",
  },
  {
    title: "Dubai Desert Safari",
    price: "from INR 5,592 per adult",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
    query: "destination=Dubai&interests=Adventure,Food",
  },
  {
    title: "Chao Phraya Dinner Cruise",
    price: "from INR 2,463 per adult",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80",
    query: "destination=Bangkok&interests=Food,Relaxation,Nightlife",
  },
];

function cardLink(query) {
  return `/create-trip?${query}&days=3&budget=Medium`;
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#061322] text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="mb-10 rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Explore</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Yatra Picks</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Browse popular destinations and experiences, then tap any card to start a ready-to-edit trip plan.
          </p>
        </div>

        <section className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/90 p-6 text-slate-100 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">Popular now</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Trending Destinations</h2>
            </div>
            <Link href="/create-trip" className="hidden rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 sm:inline-flex">
              Plan custom trip
            </Link>
          </div>
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.name}
                href={cardLink(destination.query)}
                className="group block rounded-3xl border border-teal-900/50 bg-[#061322]/75 p-3 transition hover:-translate-y-1 hover:border-teal-500 hover:bg-[#123044]"
              >
                <img src={destination.image} alt={destination.name} className="h-48 w-full rounded-2xl object-cover" />
                <h3 className="mt-5 text-center text-xl font-bold text-white">{destination.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-orange-400/30 bg-[#102433] p-6 text-slate-100 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Ranked ideas</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Top Things To Do Worldwide</h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="rounded-full border border-teal-800/70 bg-[#061322]/80 px-4 py-2 text-sm font-bold text-teal-200">Prev</span>
              <span className="rounded-full border border-teal-800/70 bg-[#061322]/80 px-4 py-2 text-sm font-bold text-teal-200">Next</span>
            </div>
          </div>
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {topExperiences.map((experience) => (
              <Link key={experience.title} href={cardLink(experience.query)} className="group block rounded-3xl border border-teal-900/50 bg-[#061322]/70 p-3 transition hover:-translate-y-1 hover:border-orange-400/70">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={experience.image} alt={experience.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute left-5 top-0 rounded-b-2xl bg-orange-400 px-5 py-3 text-2xl font-bold text-[#061322]">{experience.rank}</div>
                </div>
                <h3 className="mt-5 text-xl font-bold leading-snug text-white">{experience.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/90 p-6 text-slate-100 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">Bookable style ideas</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Trending Activities</h2>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {activities.map((activity) => (
              <Link
                key={activity.title}
                href={cardLink(activity.query)}
                className="group overflow-hidden rounded-2xl border border-teal-900/60 bg-[#061322]/80 shadow-sm transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-xl"
              >
                <img src={activity.image} alt={activity.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="p-4">
                  <h3 className="min-h-[56px] text-lg font-bold leading-snug text-white">{activity.title}</h3>
                  <p className="mt-4 text-sm text-teal-200">{activity.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
