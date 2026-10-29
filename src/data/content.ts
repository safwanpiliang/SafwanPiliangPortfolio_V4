// All copy, links and imagery live here so they can be swapped out in one place.
// Content mirrors the live safwan.id (repo Safwan-Web-Portofolio-V2, src/data).

const project = (id: string) => `/images/projects/${id}.webp`

export const profile = {
  name: 'Safwan Piliang',
  role: 'Multidisciplinary Designer',
  location: 'Jakarta / Yogyakarta, ID',
  email: 'safwanpiliang17@gmail.com',
  portrait: '/images/about/portrait.jpg',
  /** Direct Google Drive download; replace the id to swap the file (must be shared as "Anyone with the link"). */
  cv: 'https://drive.google.com/uc?export=download&id=1iMM0v3KjinXg9lZdYFGMDpj3lmXj1FGc',
}

export const socials = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/safwan-piliang-548b9a325',
  },
  { label: 'Behance', href: 'https://www.behance.net/safwanpiliang' },
  { label: 'Medium', href: 'https://safwanpiliang.medium.com' },
  { label: 'Instagram', href: 'https://www.instagram.com/safwan.piliang' },
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
      'Interfaces in Figma that turn busy brand guides into clear, usable screens, with color contrast and the mobile layout checked from the start.',
    tags: ['Figma', 'Prototyping', 'Design systems', 'Accessibility'],
    note: 'Websites for PIONIR, PORSENIGAMA, Tech Enthusiast Day and Batam Campus Expo.',
    tone: 'accent',
    previews: [project('pionir'), project('porsenigama'), project('skybase')],
  },
  {
    number: '02',
    icon: 'brand',
    title: 'Brand & Graphic Design',
    description:
      'Logos, brand guidelines and social media systems for student organizations and campus events, built in Illustrator and Photoshop.',
    tags: ['Brand identity', 'Guidelines', 'Logo design', 'Social media'],
    note: 'Identity and feed systems for BEM SV, KMID, KMTEDI, TGES and more.',
    tone: 'ink',
    previews: [project('bem-sv'), project('kmid-logo'), project('tges-logo')],
  },
  {
    number: '03',
    icon: '3d',
    title: '3D & Illustration',
    description:
      'Mascots and characters modeled in Blender, from low-poly shapes to sculpting, texturing and rendering, plus 2D character work.',
    tags: ['Blender', 'Low-poly', 'Sculpting', 'Characters'],
    note: 'Official mascots for RDK UGM, Pionir Permadani and Habitutor.',
    tone: 'paper',
    previews: [project('muzzy'), project('gadani'), project('habitutor')],
  },
] as const

export type Project = {
  id: string
  title: string
  description: string
  category: Category
  year?: string
  cover: string
  behance?: string
  medium?: string
  instagram?: string
  live?: string
}

const ig = (handle: string) => `https://www.instagram.com/${handle}`

// Order = the "All" tab order on the live site; category tabs filter this list.
export const projects: Project[] = [
  {
    id: 'kmid-logo',
    title: 'KMID UGM: Logo Redesign & Visual Identity',
    description:
      'KMID UGM (Universitas Gadjah Mada Digital Innovation Student Community) is an official student organization at UGM dedicated to coaching, developing, and mentoring students for the Student Digital Innovation Competition (LIDM).',
    category: 'Brand & Graphic Design',
    cover: project('kmid-logo'),
    behance: 'https://www.behance.net/gallery/253527903/KMID-UGM-Logo-Redesign-Visual-Identit',
  },
  {
    id: 'ted',
    title: 'Tech Enthusiast Day 2025',
    description:
      'This project represents how UI can be expressive without becoming chaotic, and playful without losing structure.',
    category: 'UI/UX & Product Design',
    year: '2025',
    cover: project('ted'),
    behance:
      'https://www.behance.net/gallery/241473405/Tech-Enthusiast-Day-Website-Visual-Driven-UI-Design',
  },
  {
    id: 'liga-trpl',
    title: 'LIGA TRPL',
    description:
      "The Liga TRPL is an annual event aimed at enhancing students' competencies in the field of software engineering through various competitions and other activities.",
    category: 'Brand & Graphic Design',
    year: '2025',
    cover: project('liga-trpl'),
    behance: 'https://www.behance.net/gallery/241451377/Liga-TRPL-2025-Post-Design',
    instagram: ig('liga_trpl'),
  },
  {
    id: 'bem-sv',
    title: 'BEM SV UGM Brand Guidelines',
    description:
      'A complete visual system built to help designers stay consistent, intentional, and on-brand from color systems and typography to visual hierarchy and design rules.',
    category: 'Brand & Graphic Design',
    cover: project('bem-sv'),
    behance: 'https://www.behance.net/gallery/253354603/Brand-Guidelines-BEM-KM-SV-UGM',
    instagram: ig('bemkmsvugm'),
  },
  {
    id: 'tges',
    title: 'TGES 2025',
    description:
      'TEDI Games and Electronic Sports is an annual sports, arts, and esports competition organized by the Department of Electrical Engineering and Informatics (TEDI), UGM Vocational College.',
    category: 'Brand & Graphic Design',
    year: '2025',
    cover: project('tges'),
    behance: 'https://www.behance.net/gallery/253395687/TGES-UGM-Social-Media-Feed-Design',
    instagram: ig('tges.ugm'),
  },
  {
    id: 'habitutor',
    title: 'Habi Habitutor Official Mascot',
    description:
      'Habitutor is an educational tutoring platform and college admission preparation app based in Indonesia.',
    category: '3D & Illustration',
    cover: project('habitutor'),
  },
  {
    id: 'tges-logo',
    title: 'TGES 2026 Event Logo & Typography',
    description:
      'Visual identity design for TGES 2026 (TEDI Games and Electronic Sports), an annual multi-event festival featuring sports, arts, and esports competitions at UGM Vocational College.',
    category: 'Brand & Graphic Design',
    year: '2026',
    cover: project('tges-logo'),
    behance: 'https://www.behance.net/gallery/253528063/TGES-2026-Event-Logo-Typography',
  },
  {
    id: 'porsenigama',
    title: 'PORSENIGAMA 2025',
    description:
      "Translating a vibrant 11-color brand guide into a clean, high-energy digital interface for UGM's largest sports festival.",
    category: 'UI/UX & Product Design',
    year: '2025',
    cover: project('porsenigama'),
    behance:
      'https://www.behance.net/gallery/241408153/PORSENIGAMA-A-Colorful-Yet-Structured-UI-Exploration',
    medium:
      'https://safwanpiliang.medium.com/taming-an-11-color-branding-guide-a-ui-case-study-on-porsenigama-2025-1bc85e6a0fd2',
    live: 'https://porsenigama25.vercel.app/2025/porsenigama/',
  },
  {
    id: 'skybase',
    title: 'SkyBase',
    description:
      'SkyBase is a web-based flight schedule management system. It is designed for airline supervisors to easily input, modify, and reschedule flight schedules.',
    category: 'UI/UX & Product Design',
    cover: project('skybase'),
    behance:
      'https://www.behance.net/gallery/253354089/SkyBase-Aviation-Inventory-Management-System',
  },
  {
    id: 'palpod',
    title: 'PALPOD UGM',
    description:
      'An educational podcast platform aimed at university students. The visuals are designed to communicate diverse academic and tech-related topics in a fun, approachable, and easily digestible format.',
    category: 'Brand & Graphic Design',
    cover: project('palpod'),
    behance:
      'https://www.behance.net/gallery/241366913/Palpod-Podcast-Instagram-Feed-Visual-Identity',
    instagram: ig('palpod.ugm'),
  },
  {
    id: 'kmtedi',
    title: 'KMTEDI UGM 2025/2026',
    description:
      'KMTEDI is an official student organization operating under the Department of Electrical Engineering and Informatics (DTEDI) at UGM Vocational College.',
    category: 'Brand & Graphic Design',
    year: '2025',
    cover: project('kmtedi'),
    behance:
      'https://www.behance.net/gallery/253395549/KMTEDI-UGM-Brand-Guidelines-and-Social-Media-Design',
    instagram: ig('kmtedi.sv.ugm'),
  },
  {
    id: 'muzzy',
    title: 'Muzzy RDK Official Mascot',
    description:
      'A playful 3D mascot created for a Ramadhan event at Universitas Gadjah Mada, bringing warmth, joy, and togetherness to life through friendly expressions, soft shapes, and cheerful visuals.',
    category: '3D & Illustration',
    cover: project('muzzy'),
    behance: 'https://www.behance.net/gallery/241449819/Ramadhan-Mascot-3D',
  },
  {
    id: 'gadani',
    title: 'GADANI Pionir Permadani UGM Official 3D Mascot',
    description:
      'The official 3D mascot for Pionir Permadani Sekolah Vokasi Universitas Gadjah Mada.',
    category: '3D & Illustration',
    cover: project('gadani'),
    behance: 'https://www.behance.net/gallery/253470589/GADANI-Official-Pionir-Permadani-3D-Mascot',
  },
  {
    id: 'pionir',
    title: 'PIONIR Gadjah Mada 2025',
    description:
      'A user interface design created for PIONIR Gadjah Mada 2025, an annual orientation and introduction program for new students at Universitas Gadjah Mada.',
    category: 'UI/UX & Product Design',
    year: '2025',
    cover: project('pionir'),
    behance:
      'https://www.behance.net/gallery/241401443/PIONIR-2025-Digital-Interface-Visual-System',
    medium:
      'https://safwanpiliang.medium.com/behind-the-interface-crafting-a-digital-welcome-for-ugms-2025-freshmen-347abe67fde9',
    live: 'https://pionirgadjahmada25.vercel.app/2025/',
  },
  {
    id: 'batam-campus-expo',
    title: 'Batam Campus Expo 2025',
    description:
      'Batam Campus Expo is the largest education fair in Batam, initiated by students from Batam who are studying at various universities across Indonesia.',
    category: 'UI/UX & Product Design',
    year: '2025',
    cover: project('batam-campus-expo'),
    behance:
      'https://www.behance.net/gallery/253353683/BATAM-CAMPUS-EXPO-Gamifying-the-College-Hunt',
    live: 'https://batamcampusexpo.onrender.com/',
  },
  {
    id: 'gdgoc',
    title: 'Google Developer Groups on Campus UGM',
    description:
      'Google Developer Groups on Campus. It is a student-led university community backed by Google, designed to help students bridge the gap between classroom theory and practical, real-world development.',
    category: 'Brand & Graphic Design',
    cover: project('gdgoc'),
    behance: 'https://www.behance.net/gallery/241364791/GDGoC-UGM-Design-Concept-Visual-System',
    instagram: ig('gdgoc.ugm'),
  },
  {
    id: 'kmid',
    title: 'KMID UGM',
    description:
      'KMID UGM is an official community under the Directorate of Student Affairs (Sub-directorate of Creativity) of UGM. This community provides a platform for students to learn, collaborate, and develop digital innovation ideas.',
    category: 'Brand & Graphic Design',
    cover: project('kmid'),
    behance: 'https://www.behance.net/gallery/253395351/KMID-Social-Media-Branding-Design',
    instagram: ig('kmidugm'),
  },
  {
    id: 'vocentic',
    title: 'VOCENTIC 2025',
    description:
      'Vocentic (Vocational Entrepreneur and Innovation Competition) is an annual event hosted by the Student Executive Board (BEM KM) of UGM Vocational College, with competitions, seminars, exhibitions, and campus tours.',
    category: 'Brand & Graphic Design',
    year: '2025',
    cover: project('vocentic'),
    behance: 'https://www.behance.net/gallery/253395841/VOCENTIC-Poster-and-Social-Media-Design',
    instagram: ig('vocentic.ugm'),
  },
  {
    id: 'nobo',
    title: '“Nobo” 2D Character Cat',
    description:
      'Nobo is a 2D character design dummy project based on my pet cat. Serving as a creative playground, this project explores various illustration styles, such as flat vectors and chibi designs, to develop engaging digital mascot assets.',
    category: '3D & Illustration',
    cover: project('nobo'),
  },
]

export const articles = [
  {
    id: 'porsenigama-case-study',
    title: 'Taming an 11 Color Palette & Shaping the Hype: A UI Case Study on PORSENIGAMA 2025',
    readTime: '6 min read',
    thumbnail: '/images/articles/porsenigama.webp',
    href: 'https://safwanpiliang.medium.com/taming-an-11-color-branding-guide-a-ui-case-study-on-porsenigama-2025-1bc85e6a0fd2',
  },
  {
    id: 'pionir-case-study',
    title: 'Behind the Interface: Crafting a “Digital Welcome” for UGM’s 2025 Freshmen',
    readTime: '5 min read',
    thumbnail: project('pionir'),
    href: 'https://safwanpiliang.medium.com/behind-the-interface-crafting-a-digital-welcome-for-ugms-2025-freshmen-347abe67fde9',
  },
]

// Hero fan: project covers, index 3 is the centre card
export const heroCards = [
  project('kmid-logo'),
  project('bem-sv'),
  project('porsenigama'),
  project('pionir'),
  project('muzzy'),
  project('ted'),
  project('gadani'),
]

export const tools = ['Figma', 'FigJam', 'Illustrator', 'Photoshop', 'Blender']
