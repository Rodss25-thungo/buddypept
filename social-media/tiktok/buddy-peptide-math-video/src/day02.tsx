import type {Day1Config} from './day01';

// Day 3 of 10: "A unit is not a dose" (Book of Ideas, Prompt 3).
// Cue timings are estimates until the voiceover mp3s land in public/;
// sync them to the real audio before rendering.

export const DAY2_EN: Day1Config = {
  id: 'Day2EN',
  flag: 'us',
  voFile: 'd2-vo-en.mp3',
  cues: [
    {from: 0.05, to: 2.2, lines: ['A UNIT IS', 'NOT A DOSE.'], teal: 1},
    {from: 2.2, to: 4.7, lines: ['THE SYRINGE SAYS', '10 UNITS.']},
    {from: 4.7, to: 6.5, lines: ['10 UNITS OF WHAT?'], teal: 1},
    {from: 6.5, to: 10.1, lines: ['U-100 = 100 UNITS', 'PER 1 ML.']},
    {from: 10.1, to: 12.7, lines: ['1 UNIT = 0.01 ML.'], teal: 1},
    {from: 12.7, to: 15.4, lines: ['UNITS MEASURE', 'LIQUID.']},
    {from: 15.4, to: 17.5, lines: ['NOT PEPTIDE.'], teal: 1},
    {from: 17.5, to: 21.5, lines: ['PEPTIDE PER UNIT', 'DEPENDS ON YOUR MIX.'], teal: 1},
    {from: 21.5, to: 24.0, lines: ['BUDDYPEPT', 'DOES THE MATH.'], teal: 1},
  ],
  cards: {
    from: 6.5,
    to: 12.7,
    a: {title: '100', sub: 'units on a U-100', value: '= 1 mL'},
    b: {title: '1', sub: 'unit', value: '= 0.01 mL'},
    bFrom: 10.1,
  },
  info: {
    from: 12.7,
    to: 24.0,
    top: 'A unit is',
    mid: '0.01 mL',
    bottom: 'volume, not peptide',
  },
  buddy: {from: 4.7, to: 24.0},
  endFrom: 24.0,
  dayChip: {from: 26.3, label: 'DAY 3 OF 10'},
  disclaimer: 'Educational tool. Not medical advice. For research purposes only.',
  durationSec: 42,
};

export const DAY2_ES: Day1Config = {
  id: 'Day2ES',
  flag: 'mx',
  voFile: 'd2-vo-es.mp3',
  cues: [
    {from: 0.1, to: 2.7, lines: ['UNA UNIDAD NO', 'ES UNA DOSIS.'], teal: 1},
    {from: 2.7, to: 5.9, lines: ['LA JERINGA MARCA', '10 UNIDADES.']},
    {from: 5.9, to: 8.1, lines: ['¿10 UNIDADES DE QUÉ?'], teal: 1},
    {from: 8.1, to: 12.6, lines: ['U-100 = 100 UNIDADES', 'POR 1 ML.']},
    {from: 12.6, to: 15.8, lines: ['1 UNIDAD = 0.01 ML.'], teal: 1},
    {from: 15.8, to: 19.1, lines: ['LAS UNIDADES', 'MIDEN LÍQUIDO.']},
    {from: 19.1, to: 21.6, lines: ['NO PÉPTIDO.'], teal: 1},
    {from: 21.6, to: 26.5, lines: ['EL PÉPTIDO POR UNIDAD', 'DEPENDE DE TU MEZCLA.'], teal: 1},
    {from: 26.5, to: 29.5, lines: ['BUDDYPEPT', 'HACE LA MATEMÁTICA.'], teal: 1},
  ],
  cards: {
    from: 8.1,
    to: 15.8,
    a: {title: '100', sub: 'unidades en una U-100', value: '= 1 mL'},
    b: {title: '1', sub: 'unidad', value: '= 0.01 mL'},
    bFrom: 12.6,
  },
  info: {
    from: 15.8,
    to: 29.5,
    top: 'Una unidad es',
    mid: '0.01 mL',
    bottom: 'volumen, no péptido',
  },
  buddy: {from: 5.9, to: 29.5},
  endFrom: 29.5,
  dayChip: {from: 32.3, label: 'DÍA 3 DE 10'},
  disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.',
  durationSec: 50,
};

export const DAY2_PT: Day1Config = {
  id: 'Day2PT',
  flag: 'br',
  voFile: 'd2-vo-pt.mp3',
  cues: [
    {from: 0.1, to: 2.5, lines: ['UMA UNIDADE NÃO', 'É UMA DOSE.'], teal: 1},
    {from: 2.5, to: 5.4, lines: ['A SERINGA MARCA', '10 UNIDADES.']},
    {from: 5.4, to: 7.4, lines: ['10 UNIDADES DE QUÊ?'], teal: 1},
    {from: 7.4, to: 11.6, lines: ['U-100 = 100 UNIDADES', 'POR 1 ML.']},
    {from: 11.6, to: 14.5, lines: ['1 UNIDADE = 0,01 ML.'], teal: 1},
    {from: 14.5, to: 17.4, lines: ['UNIDADES MEDEM', 'LÍQUIDO.']},
    {from: 17.4, to: 19.6, lines: ['NÃO PEPTÍDEO.'], teal: 1},
    {from: 19.6, to: 24.0, lines: ['O PEPTÍDEO POR UNIDADE', 'DEPENDE DA SUA MISTURA.'], teal: 1},
    {from: 24.0, to: 26.8, lines: ['O BUDDYPEPT', 'FAZ A MATEMÁTICA.'], teal: 1},
  ],
  cards: {
    from: 7.4,
    to: 14.5,
    a: {title: '100', sub: 'unidades na U-100', value: '= 1 mL'},
    b: {title: '1', sub: 'unidade', value: '= 0,01 mL'},
    bFrom: 11.6,
  },
  info: {
    from: 14.5,
    to: 26.8,
    top: 'Uma unidade é',
    mid: '0,01 mL',
    bottom: 'volume, não peptídeo',
  },
  buddy: {from: 5.4, to: 26.8},
  endFrom: 26.8,
  dayChip: {from: 29.5, label: 'DIA 3 DE 10'},
  disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.',
  durationSec: 47,
};
