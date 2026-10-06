import type {CalcVideoConfig} from './calcvideo';

type Pt = {x: number; y: number};
type LaunchTimes = {t1: number; t2: number; t3: number; t4: number; voEnd: number};
type LaunchText = {
  id: string;
  flag: 'us' | 'mx' | 'br';
  voFile: string;
  dir: string;
  caps: [string, string, string, string];
  endBeat: string;
  subBeat: string;
  chip: string;
  disclaimer: string;
  units: string;
};

const P = (x: number, y: number): Pt => ({x, y});

// Reuses the verified BPC-157 calculator capture (10 mg vial, 2 mL water, 1 mg target = 20 units).
// Times are the voiceover sentence starts from vo-*.srt plus the 1.2 s pre-roll baked into launch-vo-*.mp3.
const make = (L: LaunchText, T: LaunchTimes): CalcVideoConfig => {
  const {t1, t2, t3, t4, voEnd} = T;
  const resultAt = t3 + 1.1;
  const swaps = [
    {t: 0, i: 0}, {t: 0.5, i: 1}, {t: 0.8, i: 2}, {t: 1.0, i: 3}, {t: 1.15, i: 4}, {t: 1.3, i: 5}, {t: 1.45, i: 6},
    {t: t1 + 0.35, i: 7}, {t: t2 - 0.2, i: 8},
    {t: t2 + 0.1, i: 9}, {t: t2 + 0.4, i: 10}, {t: t2 + 0.65, i: 11}, {t: t2 + 0.95, i: 13},
    {t: t3, i: 14}, {t: t3 + 0.2, i: 15}, {t: t3 + 0.4, i: 16}, {t: t3 + 0.5, i: 17}, {t: t3 + 0.7, i: 18}, {t: t3 + 0.85, i: 19}, {t: resultAt, i: 20},
  ];
  const way = [
    {t: 0.0, at: P(900, 1550)},
    {t: 0.35, at: P(760, 1250)},
    {t: 0.5, at: 'home_open', click: true},
    {t: 0.8, at: 's1_input', click: true},
    {t: t1 + 0.45, at: 's1_option', click: true},
    {t: t2 - 0.1, at: 's1_continue', click: true},
    {t: t2 + 0.35, at: 's2_powder', click: true},
    {t: t2 + 0.6, at: 's2_continue', click: true},
    {t: t2 + 0.8, at: 's3_input', click: true},
    {t: t3 - 0.1, at: 's3_continue', click: true},
    {t: t3 + 0.3, at: 's4_continue', click: true},
    {t: t3 + 0.5, at: 's5_syringe', click: true},
    {t: t3 + 0.65, at: 's5_continue', click: true},
    {t: t3 + 0.75, at: 's6_input', click: true},
    {t: resultAt - 0.05, at: 's6_calc', click: true},
    {t: t4 - 0.4, at: P(900, 1600)},
  ];
  return {
    id: L.id,
    flag: L.flag,
    voFile: L.voFile,
    dir: L.dir,
    swaps,
    way,
    caps: [
      {from: 0.1, to: t2, text: L.caps[0]},
      {from: t2, to: t3, text: L.caps[1]},
      {from: t3, to: resultAt, text: L.caps[2]},
      {from: resultAt, to: t4, text: L.caps[3], hot: true},
    ],
    resultAt,
    endAt: t4,
    endBeats: [{at: t4, text: L.endBeat, hot: true}],
    subBeat: {at: t4 + 1.4, text: L.subBeat},
    followAt: Math.min(voEnd - 0.2, t4 + 3.0),
    seriesChip: L.chip,
    disclaimer: L.disclaimer,
    durationSec: Math.ceil(voEnd + 3),
  };
};

export const LAUNCH_EN = make(
  {id: 'CalcLaunchEN', flag: 'us', voFile: 'launch-vo-en.mp3', dir: 'calc-bpc', caps: ['1. PICK A COMPOUND', '2. ENTER THE VIAL', '3. EXACT UNITS', 'THE MATH: 20 UNITS'], endBeat: 'COMMENT A COMPOUND', subBeat: 'NEXT VIDEO: YOURS', chip: 'CALCULATOR GUIDE', disclaimer: 'Educational tool. Not medical advice. For research purposes only.', units: '20'},
  {t1: 1.25, t2: 2.46, t3: 3.62, t4: 6.19, voEnd: 10.32},
);
export const LAUNCH_ES = make(
  {id: 'CalcLaunchES', flag: 'mx', voFile: 'launch-vo-es.mp3', dir: 'calc-bpc-es', caps: ['1. ELIGE UN COMPUESTO', '2. INDICA EL VIAL', '3. UNIDADES EXACTAS', 'LA CUENTA: 20 UNIDADES'], endBeat: 'COMENTA UN COMPUESTO', subBeat: 'PRÓXIMO VIDEO: EL TUYO', chip: 'GUÍA DE LA CALCULADORA', disclaimer: 'Herramienta educativa. No es consejo médico. Solo con fines de investigación.', units: '20'},
  {t1: 1.3, t2: 3.4, t3: 5.28, t4: 8.9, voEnd: 14.28},
);
export const LAUNCH_PT = make(
  {id: 'CalcLaunchPT', flag: 'br', voFile: 'launch-vo-pt.mp3', dir: 'calc-bpc-pt', caps: ['1. ESCOLHA UM COMPOSTO', '2. INFORME O FRASCO', '3. UNIDADES EXATAS', 'A CONTA: 20 UNIDADES'], endBeat: 'COMENTE UM COMPOSTO', subBeat: 'PRÓXIMO VÍDEO: O SEU', chip: 'GUIA DA CALCULADORA', disclaimer: 'Ferramenta educacional. Não é orientação médica. Somente para fins de pesquisa.', units: '20'},
  {t1: 1.3, t2: 2.76, t3: 4.14, t4: 6.94, voEnd: 12.0},
);
