export const HER_NAME = 'Baby'

export type SpriteId = 'bunny' | 'cat' | 'heart' | 'star' | 'flower' | 'cloud' | 'mushroom' | 'butterfly' | 'bear' | 'bomb'

export interface PixelSpriteDef {
  id: SpriteId
  width: number
  height: number
  /** row-major hex colors, '.' = transparent */
  pixels: string[]
}

export const SPRITES: Record<SpriteId, PixelSpriteDef> = {
  bunny: {
    id: 'bunny',
    width: 10,
    height: 12,
    pixels: [
      '..P..P....',
      '.PPPPPP...',
      '.PWWWPW...',
      '.PWBBPW...',
      '.PPPPPP...',
      '..PPPP....',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWWWWWWW..',
      'WWP..PWW..',
      'WP....PW..',
      'WW....WW..',
    ],
  },
  cat: {
    id: 'cat',
    width: 10,
    height: 10,
    pixels: [
      'P......P..',
      'PP....PP..',
      '.PPPPPP...',
      '.PWWWPW...',
      '.PWBBPW...',
      '..PPPP....',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWP..PWW..',
      'WP....PW..',
    ],
  },
  heart: {
    id: 'heart',
    width: 9,
    height: 8,
    pixels: [
      '.PP..PP..',
      'PPPPPPP..',
      'PPPPPPP..',
      '.PPPPP...',
      '..PPP....',
      '...P.....',
      '.........',
      '.........',
    ],
  },
  star: {
    id: 'star',
    width: 9,
    height: 9,
    pixels: [
      '....Y....',
      '...YYY...',
      'YYYYYYYY.',
      '..YYYYY..',
      '.YY.Y.YY.',
      'YY..Y..YY',
      '.........',
      '.........',
      '.........',
    ],
  },
  flower: {
    id: 'flower',
    width: 9,
    height: 10,
    pixels: [
      '...P.....',
      '..PPP....',
      '.PPPPP...',
      'PPPWPPP..',
      '..PPP....',
      '...G.....',
      '..GGG....',
      '...G.....',
      '...G.....',
      '.........',
    ],
  },
  cloud: {
    id: 'cloud',
    width: 12,
    height: 7,
    pixels: [
      '...WWWW.....',
      '..WWWWWW....',
      '.WWWWWWWWW..',
      'WWWWWWWWWWWW',
      '.WWWWWWWWW..',
      '..WWWWWW....',
      '...WWWW.....',
    ],
  },
  mushroom: {
    id: 'mushroom',
    width: 8,
    height: 10,
    pixels: [
      '..RRRR..',
      '.RRRRRR.',
      'RRWRWRRR',
      '.RRRRRR.',
      '..CCCC..',
      '..CCCC..',
      '..CCCC..',
      '..CCCC..',
      '..CCCC..',
      '........',
    ],
  },
  butterfly: {
    id: 'butterfly',
    width: 11,
    height: 9,
    pixels: [
      'PP.....PP..',
      'PPP...PPP..',
      'PPPP.PPPP..',
      '..PPPPP....',
      '...PPP.....',
      '..PPPPP....',
      'PPPP.PPPP..',
      'PPP...PPP..',
      'PP.....PP..',
    ],
  },
  bear: {
    id: 'bear',
    width: 10,
    height: 11,
    pixels: [
      '.BB..BB...',
      'BBBBBBBB..',
      'BWWWWWWB..',
      'BWBWBWWB..',
      'BWWWWWWB..',
      '.BBBBBB...',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWWWWWWW..',
      'WWP..PWW..',
      'WP....PW..',
    ],
  },
  bomb: {
    id: 'bomb',
    width: 10,
    height: 9,
    pixels: [
      '....YY....',
      '...YFY....',
      '..KKKKKK..',
      '.KKKWKKKK.',
      '.KKKKKKKK.',
      '..KKKKKK..',
      '...KKKK...',
      '..KKKK....',
      '....KK....',
    ],
  },
}

export const PALETTE: Record<string, string> = {
  '.': 'transparent',
  P: '#ff6eb4',
  W: '#fff5f8',
  B: '#2d1b2e',
  Y: '#ffe566',
  G: '#7dcea0',
  R: '#ff5c8a',
  C: '#f5e6d3',
  BB: '#a0724a',
  K: '#2a2a3a',
  F: '#ff3333',
}

export const SPRITE_IDS = Object.keys(SPRITES) as SpriteId[]

export const MESSAGES = [
  `hi ${HER_NAME} ♡`,
  'you are so cute',
  'sending pixel hugs',
  'the bunnies love you',
  'today needs more pink',
  'you make everything softer',
  'collect all the love',
  'tap tap tap ♡',
  'certified cutie',
  'the clouds are gossiping about how amazing you are',
]

export const HUG_LEVELS = [
  { label: 'cozy', emoji: '♡' },
  { label: 'warm', emoji: '♡♡' },
  { label: 'toasty', emoji: '♡♡♡' },
  { label: 'MAX HUGS', emoji: '♡♡♡♡' },
]
