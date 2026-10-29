import type { ReactNode } from 'react'
import { Container, Label, Reveal } from '../ui/Layout'

const imgLogoBemSv = '/images/logos/bem-sv.png'
const imgLogoUgm = '/images/logos/ugm.svg'
const imgPionirMark = '/images/logos/pionir-mark.svg'
const imgPionirWordmark = '/images/logos/pionir-wordmark.svg'
const imgLogoGdGoC = '/images/logos/gdgoc.svg'
const imgLogoRdk = '/images/logos/rdk.svg'
const imgLogoPsgPutih = '/images/logos/psg.svg'
const imgLogoPalpod = '/images/logos/palpod.svg'
const imgLogoPermadani = '/images/logos/permadani.svg'
const imgLogoKmid = '/images/logos/kmid.svg'
const imgLogoKmtedi = '/images/logos/kmtedi.svg'
const imgLogoApecx = '/images/logos/apecx.svg'
const imgLogoTges = '/images/logos/tges.svg'
const imgLogoSkyBase = '/images/logos/skybase.svg'
const imgLogoTed = '/images/logos/ted.svg'
const imgLogoLigaTrpl = '/images/logos/liga-trpl.svg'
const imgLogoVocentic = '/images/logos/vocentic.svg'
const imgLogoAssets = '/images/logos/assets.svg'

// Recolor white/light-on-dark SVG logos into design-system mute (#6B6B6B) and ink (#111111) on hover
const svgToneClass =
  'invert grayscale opacity-50 transition-opacity duration-300 ease-out-soft hover:opacity-95'

const pngToneClass =
  'grayscale contrast-125 brightness-90 opacity-55 mix-blend-multiply transition-opacity duration-300 ease-out-soft hover:opacity-100'

type LogoItem = {
  id: string
  width: number
  height: number
  render: ReactNode
}

const row1Logos: LogoItem[] = [
  {
    id: 'ugm',
    width: 218,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[218px] shrink-0 ${svgToneClass}`}
        title="Universitas Gadjah Mada"
      >
        <img
          alt="Universitas Gadjah Mada"
          className="absolute inset-0 block max-w-none"
          src={imgLogoUgm}
        />
      </div>
    ),
  },
  {
    id: 'pionir',
    width: 228,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[228px] shrink-0 overflow-clip ${svgToneClass}`}
        title="PIONIR Gadjah Mada"
      >
        <div className="absolute inset-[0_78.5%_0_0]">
          <img alt="" className="absolute inset-0 block max-w-none" src={imgPionirMark} />
        </div>
        <div className="absolute inset-[28.38%_0_24.18%_25.06%]">
          <img
            alt="PIONIR Gadjah Mada"
            className="absolute inset-0 block max-w-none"
            src={imgPionirWordmark}
          />
        </div>
      </div>
    ),
  },
  {
    id: 'gdgoc',
    width: 149.601,
    height: 62.937,
    render: (
      <div
        className={`relative h-[62.937px] w-[149.601px] shrink-0 ${svgToneClass}`}
        title="Google Developer Groups on Campus UGM"
      >
        <img alt="GDGoC UGM" className="absolute inset-0 block max-w-none" src={imgLogoGdGoC} />
      </div>
    ),
  },
  {
    id: 'rdk',
    width: 118.423,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[118.423px] shrink-0 ${svgToneClass}`} title="RDK UGM">
        <img alt="RDK UGM" className="absolute inset-0 block max-w-none" src={imgLogoRdk} />
      </div>
    ),
  },
  {
    id: 'psg',
    width: 54.111,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[54.111px] shrink-0 ${svgToneClass}`} title="PSG">
        <img alt="PSG" className="absolute inset-0 block max-w-none" src={imgLogoPsgPutih} />
      </div>
    ),
  },
  {
    id: 'palpod',
    width: 144.328,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[144.328px] shrink-0 ${svgToneClass}`} title="Palpod">
        <img alt="Palpod" className="absolute inset-0 block max-w-none" src={imgLogoPalpod} />
      </div>
    ),
  },
  {
    id: 'bemsv',
    width: 62.885,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[62.885px] shrink-0 ${pngToneClass}`}
        title="BEM KM SV UGM"
      >
        <img
          alt="BEM KM SV UGM"
          className="absolute inset-0 block max-w-none"
          height="62"
          src={imgLogoBemSv}
          width="62.885"
        />
      </div>
    ),
  },
  {
    id: 'permadani',
    width: 65,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[65px] shrink-0 ${svgToneClass}`} title="Permadani">
        <img alt="Permadani" className="absolute inset-0 block max-w-none" src={imgLogoPermadani} />
      </div>
    ),
  },
  {
    id: 'kmid',
    width: 139.402,
    height: 61.88,
    render: (
      <div className={`relative h-[61.88px] w-[139.402px] shrink-0 ${svgToneClass}`} title="KMID">
        <img alt="KMID" className="absolute inset-0 block max-w-none" src={imgLogoKmid} />
      </div>
    ),
  },
]

const row2Logos: LogoItem[] = [
  {
    id: 'kmtedi',
    width: 61.151,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[61.151px] shrink-0 ${svgToneClass}`} title="KMTEDI">
        <img alt="KMTEDI" className="absolute inset-0 block max-w-none" src={imgLogoKmtedi} />
      </div>
    ),
  },
  {
    id: 'apecx',
    width: 66.507,
    height: 58.768,
    render: (
      <div className={`relative h-[58.768px] w-[66.507px] shrink-0 ${svgToneClass}`} title="Apecx">
        <img alt="Apecx" className="absolute inset-0 block max-w-none" src={imgLogoApecx} />
      </div>
    ),
  },
  {
    id: 'tges',
    width: 47.034,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[47.034px] shrink-0 ${svgToneClass}`} title="TGES">
        <img alt="TGES" className="absolute inset-0 block max-w-none" src={imgLogoTges} />
      </div>
    ),
  },
  {
    id: 'skybase',
    width: 252,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[252px] shrink-0 ${svgToneClass}`} title="SkyBase">
        <img alt="SkyBase" className="absolute inset-0 block max-w-none" src={imgLogoSkyBase} />
      </div>
    ),
  },
  {
    id: 'ted',
    width: 237.769,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[237.769px] shrink-0 ${svgToneClass}`}
        title="Tech Enthusiast Day"
      >
        <img
          alt="Tech Enthusiast Day"
          className="absolute inset-0 block max-w-none"
          src={imgLogoTed}
        />
      </div>
    ),
  },
  {
    id: 'ligatrpl',
    width: 90.023,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[90.023px] shrink-0 ${svgToneClass}`} title="Liga TRPL">
        <img alt="Liga TRPL" className="absolute inset-0 block max-w-none" src={imgLogoLigaTrpl} />
      </div>
    ),
  },
  {
    id: 'vocentic',
    width: 64.73,
    height: 62,
    render: (
      <div className={`relative h-[62px] w-[64.73px] shrink-0 ${svgToneClass}`} title="Vocentic">
        <img alt="Vocentic" className="absolute inset-0 block max-w-none" src={imgLogoVocentic} />
      </div>
    ),
  },
  {
    id: 'assets',
    width: 221.288,
    height: 52,
    render: (
      <div className={`relative h-[52px] w-[221.288px] shrink-0 ${svgToneClass}`} title="ASSETS">
        <img alt="ASSETS" className="absolute inset-0 block max-w-none" src={imgLogoAssets} />
      </div>
    ),
  },
]

function ScaledLogo({ item }: { item: LogoItem }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: item.width * 0.75, height: item.height * 0.75 }}
    >
      <div className="origin-top-left scale-75">{item.render}</div>
    </div>
  )
}

export function Logos() {
  return (
    <section aria-label="Clients" className="pt-20 pb-24 md:pt-28 md:pb-32">
      <Container>
        <Reveal className="text-center">
          <Label>Trusted by teams &amp; clients I&apos;ve worked with</Label>
        </Reveal>

        <Reveal delay={0.05} className="mt-10 md:mt-12">
          <div className="flex flex-col gap-9 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            {/* Row 1: looping left to right */}
            <div className="flex w-max animate-marquee-ltr items-center hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-[38px] pr-[38px]"
                >
                  {row1Logos.map((item) => (
                    <ScaledLogo key={`${item.id}-${copy}`} item={item} />
                  ))}
                </div>
              ))}
            </div>

            {/* Row 2: looping right to left */}
            <div className="flex w-max animate-marquee-rtl items-center hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-[38px] pr-[38px]"
                >
                  {row2Logos.map((item) => (
                    <ScaledLogo key={`${item.id}-${copy}`} item={item} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
