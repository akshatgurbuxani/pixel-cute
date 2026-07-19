/** Fixed copy — word "baby" only in introSub. */
export const APP_COPY = {
  headerTitle: 'for my sweetheart',
  introSub: 'dodge bombs · made for baby ♡',
  pageTitle: 'Pixel Hugs for You ♡',
} as const

/**
 * ONLY clearly-readable cute animals (+ heart/cloud/bomb for game roles).
 * No bows, butterflies, flowers, candy, stars-as-floaters, frogs-that-look-like-aliens.
 */
export type SpriteId =
  | 'bunny'
  | 'cat'
  | 'bear'
  | 'chick'
  | 'duck'
  | 'puppy'
  | 'fox'
  | 'pig'
  | 'hamster'
  | 'sheep'
  | 'mouse'
  | 'bird'
  | 'heart'
  | 'cloud'
  | 'bomb'

export interface PixelSpriteDef {
  id: SpriteId
  width: number
  height: number
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
      'L......L..',
      'LL....LL..',
      '.LLLLLL...',
      '.LWWLWL...',
      '.LWBBWL...',
      '..LLLL....',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWL..LWW..',
      'WL....LW..',
    ],
  },
  bear: {
    id: 'bear',
    width: 10,
    height: 11,
    pixels: [
      '.NN..NN...',
      'NNNNNNNN..',
      'NWWWWWWN..',
      'NWBWBWWN..',
      'NWWWWWWN..',
      '.NNNNNN...',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWWWWWWW..',
      'WWN..NWW..',
      'WN....NW..',
    ],
  },
  chick: {
    id: 'chick',
    width: 9,
    height: 9,
    pixels: [
      '...YYY...',
      '..YYYYY..',
      '.YYBYBY..',
      '.YYYYOYY.',
      '..YYYYY..',
      '...YYY...',
      '..Y...Y..',
      '.Y.....Y.',
      '.........',
    ],
  },
  duck: {
    id: 'duck',
    width: 10,
    height: 9,
    pixels: [
      '....YY....',
      '...YYYY...',
      '..YYBYYY..',
      '..YYYYYOO.',
      '.YYYYYYYY.',
      'YYYYYYYY..',
      '.YYYYYY...',
      '..Y..Y....',
      '..........',
    ],
  },
  puppy: {
    id: 'puppy',
    width: 10,
    height: 10,
    pixels: [
      'N......N..',
      'NN....NN..',
      '.NNNNNN...',
      '.NWWWNW...',
      '.NWBBWN...',
      '..NNNN....',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWN..NWW..',
      'WN....NW..',
    ],
  },
  fox: {
    id: 'fox',
    width: 10,
    height: 10,
    pixels: [
      'O......O..',
      'OO....OO..',
      '.OOOOOO...',
      '.OWWOWO...',
      '.OWBBOW...',
      '..OOOO....',
      '.WWWWWW...',
      'WWWWWWWW..',
      'WWO..OWW..',
      'WO....OW..',
    ],
  },
  pig: {
    id: 'pig',
    width: 10,
    height: 9,
    pixels: [
      '.P....P...',
      'PPPPPPPP..',
      'PWWWWWWP..',
      'PWBWWBWP..',
      'PWWLLWWP..',
      '.PPPPPP...',
      '.WWWWWW...',
      'WWP..PWW..',
      'WP....PW..',
    ],
  },
  hamster: {
    id: 'hamster',
    width: 10,
    height: 9,
    pixels: [
      '..N..N....',
      '.NNNNNN...',
      'NWWWNWWN..',
      'NWBWBWWN..',
      'NWWLLWWN..',
      '.NNNNNN...',
      '.WWWWWW...',
      'WWN..NWW..',
      'WN....NW..',
    ],
  },
  sheep: {
    id: 'sheep',
    width: 10,
    height: 10,
    pixels: [
      '...WW.....',
      '..WWWWW...',
      '.WWWWWWW..',
      'WWBWWBWWW.',
      'WWWWWWWW..',
      '.WWWWWW...',
      '..NNNN....',
      '..N..N....',
      '..N..N....',
      '..........',
    ],
  },
  mouse: {
    id: 'mouse',
    width: 10,
    height: 9,
    pixels: [
      '..W...W...',
      '.WWW.WWW..',
      '.WWWWWWW..',
      '.WPWPWWW..',
      '.WBBBWWW..',
      '..WWWWWL..',
      '.WWWWWW...',
      'WW....W...',
      '..........',
    ],
  },
  bird: {
    id: 'bird',
    width: 10,
    height: 9,
    pixels: [
      '.....A....',
      '....AAA...',
      '...AABAA..',
      '..AAAOAAA.',
      '.AAAAAAAA.',
      '..AAAAAA..',
      '...AA.AA..',
      '....A.....',
      '..........',
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
  L: '#ffb6d9',
  A: '#ff9ecd',
  W: '#fff5f8',
  B: '#2d1b2e',
  Y: '#ffe566',
  O: '#ff9f43',
  N: '#e8b88a',
  K: '#2a2a3a',
  F: '#ff3333',
}

export const SPRITE_IDS = Object.keys(SPRITES) as SpriteId[]

/** Background + catchables: animals only. */
export const ANIMAL_SPRITES: SpriteId[] = [
  'bunny',
  'cat',
  'bear',
  'chick',
  'duck',
  'puppy',
  'fox',
  'pig',
  'hamster',
  'sheep',
  'mouse',
  'bird',
]

/** Falling love items = animals + hearts. */
export const LOVE_SPRITES: SpriteId[] = [...ANIMAL_SPRITES, 'heart']

export const CUTE_SPRITES = ANIMAL_SPRITES

export const MESSAGES = [
  'hi my love ♡',
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
