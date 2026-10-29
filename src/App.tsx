import { About } from './components/sections/About'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { Insights } from './components/sections/Insights'
import { Logos } from './components/sections/Logos'
import { Navbar } from './components/sections/Navbar'
import { Projects } from './components/sections/Projects'
import { Services } from './components/sections/Services'

export default function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper text-ink">
      <Navbar />
      <main>
        <Hero />
        <Logos />
        <Services />
        <Projects />
        <Insights />
        <About />
      </main>
      <Footer />
    </div>
  )
}
