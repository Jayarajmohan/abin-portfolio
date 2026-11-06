// Every project shown on the site. Adding a new one is a single object.
// category must match one of the `categories` below.
// provider: "youtube" | "vimeo"; videoId: the id from the video URL.
// Everything here is placeholder content — TODO: replace with Abin's real projects.

export const categories = ["Commercials", "YouTube", "Music videos", "Short film"];

export const projects = [
  {
    slug: "monsoon-run",
    title: "Monsoon Run",
    client: "Northwind Sportswear",
    category: "Commercials",
    role: "Editor, colourist",
    year: 2026,
    duration: "00:00:45",
    provider: "youtube",
    videoId: "aqz-KE-bpKQ",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-1.svg",
    summary:
      "A 45-second spot built around rain, rhythm and breath — cut to the beat of the runner's footsteps.",
  },
  {
    slug: "after-hours",
    title: "After Hours",
    client: "Kappa Records",
    category: "Music videos",
    role: "Editor",
    year: 2026,
    duration: "00:03:52",
    provider: "youtube",
    videoId: "aqz-KE-bpKQ",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-2.svg",
    summary: "One-take energy assembled from four nights of handheld footage across the city.",
  },
  {
    slug: "the-long-way-home",
    title: "The Long Way Home",
    client: "Monsoon Films",
    category: "Short film",
    role: "Editor, sound design",
    year: 2025,
    duration: "00:14:20",
    provider: "vimeo",
    videoId: "76979871",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-3.svg",
    summary: "A quiet short about a father and son, shaped in the edit around what's left unsaid.",
  },
  {
    slug: "studio-tour",
    title: "Inside the Studio",
    client: "Lumen Studio",
    category: "YouTube",
    role: "Editor, motion graphics",
    year: 2025,
    duration: "00:18:05",
    provider: "youtube",
    videoId: "aqz-KE-bpKQ",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-4.svg",
    summary: "A long-form YouTube episode paced for retention, with custom titles and lower thirds.",
  },
  {
    slug: "brightside-launch",
    title: "Brightside Launch",
    client: "Brightside",
    category: "Commercials",
    role: "Editor",
    year: 2025,
    duration: "00:00:30",
    provider: "youtube",
    videoId: "aqz-KE-bpKQ",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-5.svg",
    summary: "Product launch film with three cutdowns for Instagram, YouTube pre-roll and TV.",
  },
  {
    slug: "salt",
    title: "Salt",
    client: "Halcyon",
    category: "Music videos",
    role: "Editor, colourist",
    year: 2024,
    duration: "00:04:10",
    provider: "youtube",
    videoId: "aqz-KE-bpKQ",
    software: ["Premiere Pro", "After Effects"], // TODO
    thumb: "/thumbs/project-6.svg",
    summary: "Slow, sun-bleached coastal imagery graded warm and cut against the song's swell.",
  },
];
