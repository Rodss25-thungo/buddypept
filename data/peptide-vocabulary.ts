/**
 * Every peptide name BuddyPept can recognise, and the other names people use
 * for each one.
 *
 * GENERATED FILE. Edit data/Peptide_Nomenclature.xlsx and regenerate instead of
 * editing this by hand.
 *
 * This is a recognition vocabulary, not the library. Recognising a name only
 * means the site can say "is this the one you mean" and record the request
 * against a consistent spelling. Whether a peptide can actually be calculated
 * with curated vial sizes is a separate question, answered by `slug`: set when
 * the peptide exists in data/peptides.ts, null when it does not yet.
 *
 * Public Name is the default. It is what a visitor is shown, what the request
 * is filed under, and what appears in the demand table, no matter which spelling
 * or brand name they typed to get there.
 *
 * 97 entries, 209 alternate names.
 */

export interface VocabularyEntry {
  /** Public Name from the spreadsheet. The canonical, visitor-facing name. */
  name: string;
  /** Scientific name and every recorded variation, brand and spelling. */
  aliases: string[];
  /** Slug in data/peptides.ts, when BuddyPept already curates this one. */
  slug?: string;
  /** Set for entries the spreadsheet flags as unverified. */
  needsReview?: string;
}

export const PEPTIDE_VOCABULARY: VocabularyEntry[] = [
  { name: 'Cagrilintide', aliases: [] },
  { name: 'CagriSema', aliases: ['Cagrilintide + Semaglutide', 'Cagrilintide + GLP-1 S'] },
  { name: 'Liraglutide', aliases: [] },
  { name: 'Mazdutide', aliases: ['IBI362', 'LY3305677'] },
  { name: 'Semaglutide', aliases: ['GLP-1 S'], slug: 'semaglutide' },
  { name: 'Survodutide', aliases: ['BI 456906'] },
  { name: 'Adipotide', aliases: ['Prohibitin-targeting peptide 1', 'FTPP', 'FTTP', 'Prohibitin-TP01', 'TP01'] },
  { name: 'Retatrutide', aliases: ['GLP-3 R', 'LY3437943'], slug: 'retatrutide' },
  { name: 'Tirzepatide', aliases: ['GLP-1 T', 'GLP-2', 'Tirzepitide', 'LY3298176'], slug: 'tirzepatide' },
  { name: '5-Amino-1MQ', aliases: ['5-amino-1-methylquinolinium', 'MQ1', 'NNMTi', '5-amino-1-methylquinolinium iodide'] },
  { name: 'AOD-9604', aliases: ['Tyr-human growth hormone fragment 177-191', 'Tyr-hGH(177-191)'] },
  { name: 'HGH Fragment 176-191', aliases: ['Human growth hormone fragment 176-191', 'hGH(176-191)', 'Somatotropin(176-191)'] },
  { name: 'Lipo-C', aliases: ['Lipotropic C'], needsReview: 'Unverified scientific name; formulation varies' },
  { name: 'MIC + B12', aliases: ['Methionine + Inositol + Choline + Vitamin B12', 'MIC', 'Lipo-C with B12'], needsReview: 'B12 form and formulation not specified' },
  { name: 'L-Carnitine', aliases: ['Levocarnitine', 'Carnitine'] },
  { name: 'ACE-031', aliases: ['Ramatercept', 'ActRIIB-Fc'] },
  { name: 'PEG-MGF', aliases: ['PEGylated mechano growth factor E-peptide', 'PEGylated MGF'], needsReview: 'Exact PEG conjugation specification not provided' },
  { name: 'IGF-1 LR3', aliases: ['Long R3 insulin-like growth factor I', 'Long R3 IGF-I', 'LR3 IGF-1'] },
  { name: 'MGF', aliases: ['Mechano growth factor E-peptide (IGF-1Ec E-peptide)', 'Mechano Growth Factor', 'MGF-E', 'IGF-1Ec E-peptide'] },
  { name: 'AICAR', aliases: ['Acadesine', 'AICA riboside', '5-aminoimidazole-4-carboxamide riboside', 'Z-riboside'] },
  { name: 'SLU-PP-332', aliases: [] },
  { name: 'CJC-1295 No DAC + Ipamorelin', aliases: ['Modified GRF (1-29) + Ipamorelin', 'CJC-1295 without DAC + Ipamorelin', 'CJC-1295 no DAC + IPA', 'CJC-1295/Ipamorelin'] },
  { name: 'Ipamorelin', aliases: [], slug: 'ipamorelin' },
  { name: 'Sermorelin', aliases: ['Sermorelin acetate', 'GRF(1-29)', 'GHRH(1-29)-NH2'], slug: 'sermorelin' },
  { name: 'CJC-1295 No DAC', aliases: ['Modified GRF (1-29)', 'CJC-1295 without DAC', 'Mod GRF(1-29)', 'tetrasubstituted GRF(1-29)'], slug: 'cjc-1295-no-dac' },
  { name: 'CJC-1295 With DAC', aliases: ['CJC-1295 (Drug Affinity Complex)', 'CJC-1295 DAC'], slug: 'cjc-1295-dac' },
  { name: 'GHRP-2', aliases: ['Pralmorelin', 'Growth hormone-releasing peptide 2', 'KP-102D', 'GPA 748'] },
  { name: 'Tesamorelin + Ipamorelin', aliases: [] },
  { name: 'GHRP-6', aliases: ['Growth hormone-releasing peptide 6'] },
  { name: 'Hexarelin', aliases: ['Hexarelin acetate'] },
  { name: 'Tesamorelin', aliases: [] },
  { name: 'HGH', aliases: ['Somatropin', 'Human growth hormone', 'Somatotropin'], slug: 'hgh' },
  { name: 'BPC-157 + TB-500', aliases: ['Gastric pentadecapeptide BPC-157 + N-acetyl thymosin beta-4 fragment 17-23', 'Wolverine'] },
  { name: 'TB Frag', aliases: ['TB fragment'], needsReview: 'Scientific name not verified from supplied name' },
  { name: 'Cartalax', aliases: ['Ala-Glu-Asp (AED)', 'AED', 'T-31'] },
  { name: 'TB-500', aliases: ['N-acetyl thymosin beta-4 fragment 17-23', 'Ac-LKKTETQ', 'thymosin beta-4(17-23)'], slug: 'tb-500' },
  { name: 'BPC-157', aliases: ['Gastric pentadecapeptide BPC-157'], slug: 'bpc-157' },
  { name: 'Teriparatide', aliases: ['Human PTH(1-34)', 'PTH(1-34)'] },
  { name: 'GLOW', aliases: ['BPC-157 + TB-500 + GHK-Cu'] },
  { name: 'KLOW', aliases: ['BPC-157 + TB-500 + GHK-Cu + KPV'] },
  { name: 'ARA-290', aliases: ['Cibinetide', 'pHBSP', 'pyroglutamate helix-B surface peptide'] },
  { name: 'GHK', aliases: ['Glycyl-L-histidyl-L-lysine', 'Copper-free GHK', 'Gly-His-Lys'] },
  { name: 'FOXO4-DRI', aliases: ['FOXO4 D-retro-inverso peptide', 'FOXO4-D-Retro-Inverso', 'FOX04-DRI'] },
  { name: 'N-Acetyl Epitalon Amidate', aliases: ['N-Acetyl Epithalon Amidate'], needsReview: 'Amidated scientific designation not independently verified' },
  { name: 'SS-31', aliases: ['Elamipretide', 'MTP-131', 'RX-31', 'Szeto-Schiller peptide'], slug: 'ss-31' },
  { name: 'Epitalon', aliases: ['Ala-Glu-Asp-Gly (AEDG)', 'Epithalon', 'Epithalone', 'AEDG'] },
  { name: 'NAD+', aliases: ['Nicotinamide adenine dinucleotide, oxidized form', 'oxidized NAD'], slug: 'nad-plus' },
  { name: 'PNC-27', aliases: ['p53(12-26)-Antennapedia transduction-domain chimeric peptide', 'p53(12-26) chimeric peptide'] },
  { name: 'Humanin', aliases: ['Humanin, 24-amino-acid mitochondrial-derived peptide', 'HN'] },
  { name: 'Glutathione', aliases: ['gamma-L-glutamyl-L-cysteinylglycine', 'GSH', 'reduced glutathione'] },
  { name: 'MOTS-c', aliases: ['Mitochondrial open reading frame of the 12S rRNA-c peptide', 'mitochondrial-derived peptide MOTS-c'], slug: 'mots-c' },
  { name: 'B12', aliases: ['Vitamin B12', 'Cobalamin'], needsReview: 'Vitamin B12 form not specified' },
  { name: 'Selank', aliases: [] },
  { name: 'Semax + Selank', aliases: ['Selank + Semax'] },
  { name: 'P021', aliases: ['P21', 'Peptide 021', 'GLXC-21260'] },
  { name: 'PE-22-28', aliases: ['Spadin fragment 22-28', 'Mini-Spadin', 'GVSWGLR'] },
  { name: 'Semax', aliases: ['ACTH(4-7)-Pro-Gly-Pro', 'Met-Glu-His-Phe-Pro-Gly-Pro'] },
  { name: 'DSIP', aliases: ['Delta sleep-inducing peptide'] },
  { name: 'Adamax', aliases: ['ADMAX'], needsReview: 'Scientific designation not standardized' },
  { name: 'Cerebrolysin', aliases: ['Porcine brain-derived peptide and amino-acid hydrolysate', 'CBL'] },
  { name: 'Cortagen', aliases: ['Ala-Glu-Asp-Pro (AEDP)', 'AEDP'] },
  { name: 'Melatonin', aliases: ['N-acetyl-5-methoxytryptamine'] },
  { name: 'Dermorphin', aliases: ['Tyr-D-Ala-Phe-Gly-Tyr-Pro-Ser-NH2'] },
  { name: 'Pinealon', aliases: ['Glu-Asp-Arg (EDR)', 'EDR peptide'] },
  { name: 'Thymosin Alpha-1', aliases: ['Thymalfasin', 'Tα1', 'TA1'] },
  { name: 'LL-37', aliases: ['Human cathelicidin peptide LL-37', 'cathelicidin LL-37'] },
  { name: 'Thymalin / Thymulin', aliases: ['Thymalin', 'Thymulin'], needsReview: 'Input combines two distinct compounds' },
  { name: 'Crystagen', aliases: ['Glu-Asp-Pro (EDP)', 'EDP peptide'] },
  { name: 'KPV', aliases: ['Lys-Pro-Val, alpha-MSH fragment 11-13', 'α-MSH(11-13)', 'Lys-Pro-Val'] },
  { name: 'SNAP-8', aliases: ['Acetyl octapeptide-3'] },
  { name: 'Matrixyl', aliases: ['Palmitoyl pentapeptide-4', 'Pal-KTTKS', 'palmitoyl pentapeptide-3'], needsReview: 'Matrixyl variant not specified' },
  { name: 'Melanotan I', aliases: ['Afamelanotide', 'Melanotan-1', 'MT-I', 'NDP-alpha-MSH'] },
  { name: 'Botulinum Toxin', aliases: ['BoNT', 'botulinum neurotoxin'], needsReview: 'Serotype/product not specified' },
  { name: 'PTD-DBM', aliases: ['Protein transduction domain-Dishevelled binding motif peptide', 'PTD-DBM peptide'] },
  { name: 'AHK-Cu', aliases: ['L-alanyl-L-histidyl-L-lysine-Cu(II)', 'Copper tripeptide-3'] },
  { name: 'GHK-Cu', aliases: ['Glycyl-L-histidyl-L-lysine-Cu(II)', 'GHK-Copper'], slug: 'ghk-cu' },
  { name: 'Melanotan II', aliases: ['Melanotan 2', 'MT-II', 'MT2'] },
  { name: 'Gonadorelin', aliases: ['Gonadorelin acetate', 'GnRH', 'LHRH'] },
  { name: 'HMG', aliases: ['Menotropins', 'Human menopausal gonadotropin', 'urogonadotropin'] },
  { name: 'Kisspeptin-10', aliases: ['KP-10', 'Metastin(45-54)', 'Kisspetin-10'] },
  { name: 'PT-141', aliases: ['Bremelanotide', 'bremelanotide acetate'], slug: 'pt-141' },
  { name: 'HCG', aliases: ['Human chorionic gonadotropin', 'chorionic gonadotropin'], slug: 'hcg' },
  { name: 'Testagen', aliases: ['Lys-Glu-Asp-Gly (KEDG)', 'KEDG'] },
  { name: 'Oxytocin', aliases: ['Oxytocin acetate'] },
  { name: 'Cardiogen', aliases: ['Ala-Glu-Asp-Arg (AEDR)', 'AEDR'] },
  { name: 'Bronchogen', aliases: ['Ala-Glu-Asp-Leu (AEDL)', 'AEDL'] },
  { name: 'Chonluten', aliases: ['Glu-Asp-Gly (EDG)', 'Chonluton', 'EDG'] },
  { name: 'Livagen', aliases: ['Lys-Glu-Asp-Ala (KEDA)', 'KEDA'] },
  { name: 'Vesugen', aliases: ['Lys-Glu-Asp (KED)', 'KED'] },
  { name: 'Ovagen', aliases: ['Glu-Asp-Leu (EDL)', 'EDL'] },
  { name: 'Prostamax', aliases: ['Lys-Glu-Asp-Pro (KEDP)', 'KEDP'] },
  { name: 'Pancragen', aliases: ['Lys-Glu-Asp-Trp (KEDW)', 'KEDW'] },
  { name: 'EPO', aliases: ['Erythropoietin'] },
  { name: 'B7-33', aliases: ['Human relaxin-2 B-chain analog B7-33', 'H2 relaxin B7-33', 'relaxin B-chain 7-33'] },
  { name: 'VIP', aliases: ['Vasoactive intestinal peptide', 'VIP-28', 'aviptadil'] },
  { name: 'Acetic Acid', aliases: ['Ethanoic acid'] },
  { name: 'Bacteriostatic Water', aliases: ['Bacteriostatic Water for Injection, USP', 'BAC water', 'BWFI', 'Research Water'] },
];
