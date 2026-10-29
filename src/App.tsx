import { useCallback, useState } from 'react'
import { LoadingScreen, shouldShowIntro } from './components/effects/LoadingScreen'
import { About } from './components/sections/About'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { Insights } from './components/sections/Insights'
import { Logos } from './components/sections/Logos'
import { Navbar } from './components/sections/Navbar'
import { Projects } from './components/sections/Projects'
import { Services } from './components/sections/Services'

export default function App() {
  const [showIntro] = useState(shouldShowIntro)
  // Hero entrance waits for the intro so it doesn't play behind the loader
  const [ready, setReady] = useState(!showIntro)
  const finishIntro = useCallback(() => setReady(true), [])

  return (
    <div className="min-h-screen overflow-x-clip bg-paper text-ink">
      {showIntro && <LoadingScreen onDone={finishIntro} />}
      <Navbar ready={ready} />
      <main>
        <Hero ready={ready} />
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
