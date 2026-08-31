export type Cue = {from: number; to: number; lines: [string, string?]; teal?: 0 | 1};

export type LocaleConfig = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  cues: Cue[];
  calc: {from: number; to: number; rows: {label: string; value: string; delay: number}[]};
  result: {from: number; to: number; top: string; mid: string; bottom: string};
  buddy: {from: number; to: number};
  endFrom: number;
  disclaimer: string;
  durationSec: number;
};

export const EN: LocaleConfig = {
  id: 'BuddyMath',
  flag: 'us',
  voFile: 'voiceover.mp3',
  cues: [
    {from: 0.05, to: 3.03, lines: ['STARTING YOUR RESEARCH?', 'THE VIAL JUST ARRIVED.'], teal: 1},
    {from: 3.03, to: 3.87, lines: ['NOW WHAT?']},
    {from: 3.87, to: 7.96, lines: ['5 MG OF POWDER', "DOESN'T TELL YOU UNITS."], teal: 1},
    {from: 7.96, to: 9.01, lines: ["THAT'S MATH."]},
    {from: 9.01, to: 10.66, lines: ['BUDDYPEPT', 'DOES IT FOR YOU.'], teal: 1},
    {from: 10.66, to: 11.82, lines: ['ENTER THE VIAL.']},
    {from: 11.82, to: 12.75, lines: ['THE WATER.']},
    {from: 12.75, to: 13.98, lines: ['THE TARGET AMOUNT.']},
    {from: 13.98, to: 17.64, lines: ['EXACT UNITS ON', 'A U-100 SYRINGE.'], teal: 1},
    {from: 17.64, to: 18.88, lines: ['STEP BY STEP.']},
    {from: 18.88, to: 19.86, lines: ['EXPLAINED.']},
    {from: 19.86, to: 20.6, lines: ['FREE.']},
    {from: 20.6, to: 21.73, lines: ['NO PAYWALL.']},
    {from: 21.73, to: 22.47, lines: ['EVER.'], teal: 1},
  ],
  calc: {
    from: 10.66,
    to: 13.98,
    rows: [
      {label: 'Vial', value: '5 mg', delay: 0},
      {label: 'Bac water', value: '2 mL', delay: 1.16},
      {label: 'Target amount', value: '0.25 mg', delay: 2.09},
    ],
  },
  result: {from: 13.98, to: 19.86, top: 'Draw to', mid: '10 UNITS', bottom: 'on a U-100 syringe'},
  buddy: {from: 9.01, to: 22.47},
  endFrom: 22.47,
  disclaimer: 'Educational tool. Not medical advice. Research use only.',
  durationSec: 32,
};

export const ES: LocaleConfig = {
  id: 'BuddyMathES',
  flag: 'mx',
  voFile: 'voiceover-es.mp3',
  cues: [
    {from: 0.1, to: 3.97, lines: ['¿EMPEZANDO TU INVESTIGACIÓN?', 'EL VIAL YA LLEGÓ.'], teal: 1},
    {from: 3.97, to: 5.74, lines: ['¿Y AHORA QUÉ?']},
    {from: 5.74, to: 10.2, lines: ['5 MG DE POLVO', 'NO TE DICEN LAS UNIDADES.'], teal: 1},
    {from: 10.2, to: 12.34, lines: ['ESO ES MATEMÁTICA.']},
    {from: 12.34, to: 14.78, lines: ['BUDDYPEPT', 'LO HACE POR TI.'], teal: 1},
    {from: 14.78, to: 16.73, lines: ['INGRESA EL VIAL.']},
    {from: 16.73, to: 18.25, lines: ['EL AGUA.']},
    {from: 18.25, to: 20.55, lines: ['LA CANTIDAD OBJETIVO.']},
    {from: 20.55, to: 24.61, lines: ['UNIDADES EXACTAS EN', 'UNA JERINGA U-100.'], teal: 1},
    {from: 24.61, to: 26.33, lines: ['PASO A PASO.']},
    {from: 26.33, to: 28.06, lines: ['EXPLICADO.']},
    {from: 28.06, to: 29.69, lines: ['GRATIS.']},
    {from: 29.69, to: 31.78, lines: ['SIN MUROS DE PAGO.']},
    {from: 31.78, to: 33.24, lines: ['NUNCA.'], teal: 1},
  ],
  calc: {
    from: 14.78,
    to: 20.55,
    rows: [
      {label: 'Vial', value: '5 mg', delay: 0},
      {label: 'Agua bacteriostática', value: '2 mL', delay: 1.95},
      {label: 'Cantidad objetivo', value: '0.25 mg', delay: 3.47},
    ],
  },
  result: {from: 20.55, to: 28.06, top: 'Carga hasta', mid: '10 UNIDADES', bottom: 'en una jeringa U-100'},
  buddy: {from: 12.34, to: 33.24},
  endFrom: 33.24,
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 46,
};

export const PT: LocaleConfig = {
  id: 'BuddyMathPT',
  flag: 'br',
  voFile: 'voiceover-pt.mp3',
  cues: [
    {from: 0.1, to: 4.17, lines: ['COMEÇANDO SUA PESQUISA?', 'O FRASCO CHEGOU.'], teal: 1},
    {from: 4.17, to: 5.7, lines: ['E AGORA?']},
    {from: 5.7, to: 10.03, lines: ['5 MG DE PÓ', 'NÃO DIZEM AS UNIDADES.'], teal: 1},
    {from: 10.03, to: 12.1, lines: ['ISSO É MATEMÁTICA.']},
    {from: 12.1, to: 14.86, lines: ['O BUDDYPEPT', 'FAZ POR VOCÊ.'], teal: 1},
    {from: 14.86, to: 16.86, lines: ['INSIRA O FRASCO.']},
    {from: 16.86, to: 18.35, lines: ['A ÁGUA.']},
    {from: 18.35, to: 20.47, lines: ['A QUANTIDADE ALVO.']},
    {from: 20.47, to: 24.22, lines: ['UNIDADES EXATAS NA', 'SERINGA U-100.'], teal: 1},
    {from: 24.22, to: 26.02, lines: ['PASSO A PASSO.']},
    {from: 26.02, to: 27.64, lines: ['EXPLICADO.']},
    {from: 27.64, to: 29.23, lines: ['GRÁTIS.']},
    {from: 29.23, to: 31.13, lines: ['SEM COBRANÇA.']},
    {from: 31.13, to: 32.56, lines: ['NUNCA.'], teal: 1},
  ],
  calc: {
    from: 14.86,
    to: 20.47,
    rows: [
      {label: 'Frasco', value: '5 mg', delay: 0},
      {label: 'Água bacteriostática', value: '2 mL', delay: 2.0},
      {label: 'Quantidade alvo', value: '0.25 mg', delay: 3.49},
    ],
  },
  result: {from: 20.47, to: 27.64, top: 'Puxe até', mid: '10 UNIDADES', bottom: 'na seringa U-100'},
  buddy: {from: 12.1, to: 32.56},
  endFrom: 32.56,
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 46,
};
