import type { ReactNode } from 'react'
import { Container, Label, Reveal } from '../ui/Layout'

const assetPathPrefix = '/assets'
const imgLogoBemSv = `${assetPathPrefix}/a3068.png`
const imgLogoUgm = `${assetPathPrefix}/008ed.svg`
const imgGroup = `${assetPathPrefix}/cb0b8.svg`
const imgGroup1 = `${assetPathPrefix}/3a168.svg`
const imgLogoGdGoC = `${assetPathPrefix}/621f4.svg`
const imgLogoRdk = `${assetPathPrefix}/92b34.svg`
const imgLogoPsgPutih = `${assetPathPrefix}/99730.svg`
const imgLogoPalpod = `${assetPathPrefix}/3c390.svg`
const imgLogoPermadani = `${assetPathPrefix}/16fa7.svg`
const imgLogoKmid = `${assetPathPrefix}/af0b2.svg`
const imgLogoKmtedi = `${assetPathPrefix}/ef8dd.svg`
const imgLogoApecx = `${assetPathPrefix}/d7ea8.svg`
const imgLogoTges = `${assetPathPrefix}/b0d5c.svg`
const imgLogoSkyBase = `${assetPathPrefix}/1a565.svg`
const imgLogoTed = `${assetPathPrefix}/d1d48.svg`
const imgLogoLigaTrpl = `${assetPathPrefix}/bcdce.svg`
const imgLogoVocentic = `${assetPathPrefix}/52abb.svg`
const imgLogoAssets = `${assetPathPrefix}/ecab7.svg`

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
        data-node-id="6:383"
        data-name="Logo UGM"
        title="Universitas Gadjah Mada"
      >
        <img alt="Universitas Gadjah Mada" className="absolute inset-0 block max-w-none" src={imgLogoUgm} />
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
        data-node-id="6:499"
        data-name="Logo PIONIR"
        title="PIONIR Gadjah Mada"
      >
        <div className="absolute inset-[0_78.5%_0_0]" data-node-id="6:500" data-name="Group">
          <img alt="" className="absolute inset-0 block max-w-none" src={imgGroup} />
        </div>
        <div className="absolute inset-[28.38%_0_24.18%_25.06%]" data-node-id="6:507" data-name="Group">
          <img alt="PIONIR Gadjah Mada" className="absolute inset-0 block max-w-none" src={imgGroup1} />
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
        data-node-id="6:528"
        data-name="Logo GDGoC"
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
      <div
        className={`relative h-[62px] w-[118.423px] shrink-0 ${svgToneClass}`}
        data-node-id="6:535"
        data-name="Logo RDK"
        title="RDK UGM"
      >
        <img alt="RDK UGM" className="absolute inset-0 block max-w-none" src={imgLogoRdk} />
      </div>
    ),
  },
  {
    id: 'psg',
    width: 54.111,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[54.111px] shrink-0 ${svgToneClass}`}
        data-node-id="6:538"
        data-name="Logo PSG Putih"
        title="PSG"
      >
        <img alt="PSG" className="absolute inset-0 block max-w-none" src={imgLogoPsgPutih} />
      </div>
    ),
  },
  {
    id: 'palpod',
    width: 144.328,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[144.328px] shrink-0 ${svgToneClass}`}
        data-node-id="6:560"
        data-name="Logo Palpod"
        title="Palpod"
      >
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
        data-node-id="6:569"
        data-name="Logo BEM SV"
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
      <div
        className={`relative h-[62px] w-[65px] shrink-0 ${svgToneClass}`}
        data-node-id="6:570"
        data-name="Logo Permadani"
        title="Permadani"
      >
        <img alt="Permadani" className="absolute inset-0 block max-w-none" src={imgLogoPermadani} />
      </div>
    ),
  },
  {
    id: 'kmid',
    width: 139.402,
    height: 61.88,
    render: (
      <div
        className={`relative h-[61.88px] w-[139.402px] shrink-0 ${svgToneClass}`}
        data-node-id="6:604"
        data-name="Logo KMID"
        title="KMID"
      >
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
      <div
        className={`relative h-[62px] w-[61.151px] shrink-0 ${svgToneClass}`}
        data-node-id="6:606"
        data-name="Logo KMTEDI"
        title="KMTEDI"
      >
        <img alt="KMTEDI" className="absolute inset-0 block max-w-none" src={imgLogoKmtedi} />
      </div>
    ),
  },
  {
    id: 'apecx',
    width: 66.507,
    height: 58.768,
    render: (
      <div
        className={`relative h-[58.768px] w-[66.507px] shrink-0 ${svgToneClass}`}
        data-node-id="6:659"
        data-name="Logo Apecx"
        title="Apecx"
      >
        <img alt="Apecx" className="absolute inset-0 block max-w-none" src={imgLogoApecx} />
      </div>
    ),
  },
  {
    id: 'tges',
    width: 47.034,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[47.034px] shrink-0 ${svgToneClass}`}
        data-node-id="6:661"
        data-name="Logo TGES"
        title="TGES"
      >
        <img alt="TGES" className="absolute inset-0 block max-w-none" src={imgLogoTges} />
      </div>
    ),
  },
  {
    id: 'skybase',
    width: 252,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[252px] shrink-0 ${svgToneClass}`}
        data-node-id="6:679"
        data-name="Logo SkyBase"
        title="SkyBase"
      >
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
        data-node-id="6:681"
        data-name="Logo TED"
        title="Tech Enthusiast Day"
      >
        <img alt="Tech Enthusiast Day" className="absolute inset-0 block max-w-none" src={imgLogoTed} />
      </div>
    ),
  },
  {
    id: 'ligatrpl',
    width: 90.023,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[90.023px] shrink-0 ${svgToneClass}`}
        data-node-id="6:684"
        data-name="Logo Liga TRPL"
        title="Liga TRPL"
      >
        <img alt="Liga TRPL" className="absolute inset-0 block max-w-none" src={imgLogoLigaTrpl} />
      </div>
    ),
  },
  {
    id: 'vocentic',
    width: 64.73,
    height: 62,
    render: (
      <div
        className={`relative h-[62px] w-[64.73px] shrink-0 ${svgToneClass}`}
        data-node-id="6:685"
        data-name="Logo Vocentic"
        title="Vocentic"
      >
        <img alt="Vocentic" className="absolute inset-0 block max-w-none" src={imgLogoVocentic} />
      </div>
    ),
  },
  {
    id: 'assets',
    width: 221.288,
    height: 52,
    render: (
      <div
        className={`relative h-[52px] w-[221.288px] shrink-0 ${svgToneClass}`}
        data-node-id="6:688"
        data-name="Logo Assets"
        title="ASSETS"
      >
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
          <div
            data-node-id="6:382"
            className="flex flex-col gap-9 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
          >
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
