// All copy, links and imagery live here so they can be swapped out in one place.

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const profile = {
  name: 'Safwan Piliang',
  role: 'Product & Brand Designer',
  location: 'Yogyakarta-Jakarta, ID',
  email: 'hello@safwan.id',
  portrait: img('photo-1790574318425-a70b77fece96', 900),
}

export const socials = [
  { label: 'Behance', href: 'https://www.behance.net/' },
  { label: 'Medium', href: 'https://medium.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
]

export const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Insights', href: '#insights' },
  { label: 'About', href: '#about' },
]

export type Category = 'UI/UX & Product Design' | 'Brand & Graphic Design' | '3D & Illustration'

export const categories: Category[] = [
  'UI/UX & Product Design',
  'Brand & Graphic Design',
  '3D & Illustration',
]

export const services = [
  {
    number: '01',
    icon: 'ui',
    title: 'UI/UX & Product Design',
    description:
      'User research, wireframing, interface design, design systems, and prototyping for web and mobile products that are usable and delightful.',
    tags: ['Research', 'Wireframes', 'Design systems', 'Prototyping'],
    note: 'Interfaces engineered for clarity, speed, and real user workflows.',
    tone: 'accent',
    previews: [
      img('photo-1771922748624-b205cf5d002d', 500),
      img('photo-1767449441925-737379bc2c4d', 500),
      img('photo-1581287053822-fd7bf4f4bfec', 500),
    ],
  },
  {
    number: '02',
    icon: 'brand',
    title: 'Brand & Graphic Design',
    description:
      'Logo and visual identity, brand guidelines, social media assets, posters, and print/digital collateral that give brands a consistent voice.',
    tags: ['Identity', 'Guidelines', 'Social', 'Print'],
    note: 'Distinct visual systems that stay unmistakable across every touchpoint.',
    tone: 'ink',
    previews: [
      img('photo-1759709867188-7d94e0041de2', 500),
      img('photo-1596221780522-71f822d9f63b', 500),
      img('photo-1763705857736-2b4f16a33758', 500),
    ],
  },
  {
    number: '03',
    icon: '3d',
    title: '3D & Illustration',
    description:
      '3D modeling and rendering, custom illustrations, and visual assets that add depth and personality to digital products and campaigns.',
    tags: ['Modeling', 'Rendering', 'Illustration', 'Assets'],
    note: 'Tactile 3D renders and custom visuals that bring warmth to digital screens.',
    tone: 'paper',
    previews: [
      img('photo-1672080070762-764c74ee1227', 500),
      img('photo-1710244182004-1c708b3f146d', 500),
      img('photo-1622547748225-3fc4abd2cca0', 500),
    ],
  },
] as const

export type Project = {
  id: string
  title: string
  description: string
  category: Category
  year: string
  cover: string
  behance?: string
  medium?: string
  live?: string
}

export const projects: Project[] = [
  {
    id: 'internship',
    title: 'Internship Management System Redesign',
    description:
      'A ground-up redesign of a university internship portal: clearer flows for students, supervisors and partners, built on a reusable component library.',
    category: 'UI/UX & Product Design',
    year: '2025',
    cover: img('photo-1771922748624-b205cf5d002d'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    live: 'https://example.com/',
  },
  {
    id: 'jersey',
    title: 'Esports Team Jersey Identity',
    description:
      'Visual identity and jersey system for a regional esports roster, with an aggressive mark, kit patterns and matchday graphics.',
    category: 'Brand & Graphic Design',
    year: '2025',
    cover: img('photo-1759709867188-7d94e0041de2'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    live: 'https://example.com/',
  },
  {
    id: 'render',
    title: '3D Product Render Series',
    description:
      'A series of studio-lit product renders made in Blender, exploring material, light and composition for e-commerce launches.',
    category: '3D & Illustration',
    year: '2024',
    cover: img('photo-1672080070762-764c74ee1227'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    // No live link: shows the disabled state
  },
  {
    id: 'campaign',
    title: 'Event Social Media Campaign',
    description:
      'A modular poster and social template kit for a campus tech festival that kept 40+ posts consistent across three weeks.',
    category: 'Brand & Graphic Design',
    year: '2024',
    cover: img('photo-1596221780522-71f822d9f63b'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    live: 'https://example.com/',
  },
  {
    id: 'wayfinding',
    title: 'Campus Wayfinding Mobile App',
    description:
      'A mobile companion that helps new students find rooms, events and friends across a sprawling campus, tested with 12 first-year students.',
    category: 'UI/UX & Product Design',
    year: '2024',
    cover: img('photo-1767449441925-737379bc2c4d'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    live: 'https://example.com/',
  },
  {
    id: 'shapes',
    title: 'Playful Shapes Illustration Kit',
    description:
      'A set of soft, toy-like 3D illustrations for onboarding screens and empty states, designed to add warmth to a fintech product.',
    category: '3D & Illustration',
    year: '2023',
    cover: img('photo-1710244182004-1c708b3f146d'),
    behance: 'https://www.behance.net/',
    medium: 'https://medium.com/',
    live: 'https://example.com/',
  },
]

export const articles = [
  {
    id: 'a1',
    title: 'What redesigning an internship system taught me about real users',
    date: 'Mar 12, 2026',
    readTime: '6 min read',
    thumbnail: img('photo-1531346878377-a5be20888e57', 900),
    href: 'https://medium.com/',
  },
  {
    id: 'a2',
    title: 'Design systems for students: start small, stay consistent',
    date: 'Jan 28, 2026',
    readTime: '8 min read',
    thumbnail: img('photo-1576153192396-180ecef2a715', 900),
    href: 'https://medium.com/',
  },
  {
    id: 'a3',
    title: 'From Blender to brand: using 3D in everyday design work',
    date: 'Nov 04, 2025',
    readTime: '5 min read',
    thumbnail: img('photo-1622547748225-3fc4abd2cca0', 900),
    href: 'https://medium.com/',
  },
]

// Hero fan: a mix of project covers and extra visuals
export const heroCards = [
  img('photo-1617791160505-6f00504e3519', 600),
  img('photo-1759709867188-7d94e0041de2', 600),
  img('photo-1767449441925-737379bc2c4d', 600),
  img('photo-1672080070762-764c74ee1227', 600),
  img('photo-1763705857736-2b4f16a33758', 600),
  img('photo-1596221780522-71f822d9f63b', 600),
  img('photo-1710244182004-1c708b3f146d', 600),
]

// Placeholder client wordmarks; replace with real SVG logos
export const clients = [
  { name: 'Northwind', mark: 'circle' },
  { name: 'Lumen', mark: 'square' },
  { name: 'Orbit Labs', mark: 'ring' },
  { name: 'Kaliuma', mark: 'triangle' },
  { name: 'Pixelforge', mark: 'grid' },
  { name: 'Halcyon', mark: 'half' },
  { name: 'Meridian', mark: 'bars' },
  { name: 'Studio Rasa', mark: 'diamond' },
] as const

export const tools = ['Figma', 'Illustrator', 'Blender', 'Photoshop']

export const stats = [
  { value: '20+', label: 'Projects shipped' },
  { value: '3', label: 'Years of experience' },
  { value: '12', label: 'Happy clients' },
]
