import { useCallback, useState } from 'react'
import { LoadingScreen, shouldShowIntro } from './components/effects/LoadingScreen'
import { About } from './components/sections/About'
import { EditorialBand } from './components/sections/EditorialBand'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { Insights } from './components/sections/Insights'
import { Landing } from './components/sections/Landing'
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
    // relative: cursors position against this box, so overflow-x-clip also clips their chat bubbles
    <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">
      {showIntro && <LoadingScreen onDone={finishIntro} />}
      <Navbar ready={ready} />
      <main>
        <Landing ready={ready}>{(revealed) => <Hero ready={ready && revealed} />}</Landing>
        <Logos />
        <Services />
        <EditorialBand />
        <Projects />
        <Insights />
        <About />
      </main>
      <Footer />
      {/* FakeCursors disabled for now (src/components/effects/FakeCursors.tsx) */}
    </div>
  )
}
