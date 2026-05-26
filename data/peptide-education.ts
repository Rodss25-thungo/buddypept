/**
 * Educational summaries for the gated "Learn about peptides" library.
 *
 * Kept SEPARATE from data/peptides.ts so the calculator's data shape is never
 * affected. Content rules (locked with Rod): original neutral writing, no
 * copied text, NO health claims ("studied for", never "treats/cures"), and the
 * "not approved / research / for testing" framing where it applies. The legal
 * status and "last reviewed" date come from data/peptides.ts.
 */

export interface PeptideEducation {
  /** One-line teaser shown before the email unlock. */
  teaser: string;
  whatItIs: string;
  studiedFor: string;
  howSold: string;
  bottomLine: string;
}

export const PEPTIDE_EDUCATION: Record<string, PeptideEducation> = {
  semaglutide: {
    teaser: 'An FDA-approved GLP-1 medicine for diabetes and weight.',
    whatItIs: 'A GLP-1 receptor agonist.',
    studiedFor:
      'FDA-approved for type 2 diabetes (Ozempic) and weight management (Wegovy), and studied in large clinical trials. Rybelsus is an oral form for diabetes.',
    howSold:
      'By prescription as a pre-filled pen or vial (Ozempic, Wegovy) or tablets (Rybelsus). It is also sold by gray-market vendors as a research powder, which is not the approved product.',
    bottomLine:
      'Semaglutide is an FDA-approved prescription medicine. The approved product comes through a licensed provider and pharmacy, and decisions about it belong with them.',
  },
  'bpc-157': {
    teaser: 'A lab-made peptide studied in animals for tissue repair.',
    whatItIs:
      'A synthetic peptide, a short chain of amino acids based on a sequence found in a protein in gastric juice. It is made in a lab.',
    studiedFor:
      'In published preclinical work, mostly animal and laboratory studies, it has been examined for tissue repair, tendon and ligament healing, and gastrointestinal effects. These are early research findings, not proven results in people.',
    howSold:
      'As a freeze-dried powder in glass vials, commonly 5 mg or 10 mg, mixed with bacteriostatic water before use.',
    bottomLine:
      'The science is early and mostly preclinical. Whether it is appropriate, legal, or safe for any person is a decision for that person and a licensed healthcare provider.',
  },
  'tb-500': {
    teaser: 'A synthetic fragment of a natural protein, studied for repair.',
    whatItIs:
      'A synthetic version of a fragment of thymosin beta-4, a protein that occurs naturally in the body. It is made in a lab.',
    studiedFor:
      'Preclinical studies have looked at it for tissue repair, wound healing, and inflammation in animal and laboratory models. These are research findings, not proven effects in people.',
    howSold:
      'As a freeze-dried powder in glass vials, commonly 5 mg or 10 mg, reconstituted with bacteriostatic water.',
    bottomLine:
      'The evidence is largely preclinical. Whether it is appropriate, legal, or safe for any person is a decision for that person and a licensed healthcare provider.',
  },
  'ghk-cu': {
    teaser: 'A copper peptide common in skincare and studied for repair.',
    whatItIs:
      'A copper-binding peptide (copper tripeptide-1) that occurs naturally in human plasma, with levels that decline with age. It is produced synthetically for products.',
    studiedFor:
      'Studied for skin remodeling, hair, and wound healing. It is widely used in topical cosmetics and has been examined as an injectable in research settings.',
    howSold:
      'As a powder in vials (often 50 mg or 100 mg) for reconstitution, and in many topical skincare products.',
    bottomLine:
      'Topical cosmetic use is common; injectable use is research-stage. Whether it is appropriate, legal, or safe for any person is a decision for that person and a licensed healthcare provider.',
  },
  ipamorelin: {
    teaser: 'A peptide studied for how the body releases growth hormone.',
    whatItIs:
      'A synthetic peptide that signals the pituitary gland. It is classed as a growth hormone secretagogue.',
    studiedFor:
      'Researched for its effect on the body’s own growth hormone release, often discussed alongside CJC-1295. Findings are largely preclinical.',
    howSold:
      'As a powder in vials (commonly 2, 5, or 10 mg), reconstituted with bacteriostatic water. Often paired with CJC-1295.',
    bottomLine:
      'The research is early. Whether it is appropriate, legal, or safe for any person is a decision for that person and a licensed healthcare provider.',
  },
  'cjc-1295': {
    teaser: 'A growth-hormone-releasing-hormone analog studied in research.',
    whatItIs:
      'A synthetic analog of growth hormone releasing hormone (GHRH). It exists in two forms, with and without DAC, which differ in how long they last in the body.',
    studiedFor:
      'Examined for its influence on the body’s growth hormone release, and commonly studied together with ipamorelin. Findings are largely preclinical.',
    howSold:
      'As a powder in vials (commonly 2 or 5 mg), reconstituted with bacteriostatic water.',
    bottomLine:
      'The research is early. Whether it is appropriate, legal, or safe for any person is a decision for that person and a licensed healthcare provider.',
  },
  sermorelin: {
    teaser: 'A prescription GHRH analog used in some hormone protocols.',
    whatItIs:
      'A synthetic analog of growth hormone releasing hormone (GHRH).',
    studiedFor:
      'FDA-approved (as Geref) for diagnostic testing of pituitary function, and prescribed off-label in some anti-aging and hormone protocols.',
    howSold:
      'By prescription, including from compounding pharmacies, as a powder for reconstitution (commonly 2 to 15 mg vials).',
    bottomLine:
      'Sermorelin is a prescription medication. Whether it is right for you is a decision for you and a licensed healthcare provider.',
  },
  retatrutide: {
    teaser: 'An investigational metabolic peptide, still in clinical trials.',
    whatItIs:
      'An investigational peptide that acts on three receptors (GLP-1, GIP, and glucagon).',
    studiedFor:
      'Being tested in clinical trials for metabolic conditions such as obesity and type 2 diabetes. It is not yet approved for any use in any country.',
    howSold:
      'Not approved or sold as a finished medicine. Gray-market vendors sell it as a research compound in powder vials (commonly 10 or 30 mg).',
    bottomLine:
      'Retatrutide is still investigational and not approved anywhere. Any use outside a clinical trial is unproven, and decisions belong with a licensed professional.',
  },
  tirzepatide: {
    teaser: 'An FDA-approved dual-receptor medicine for diabetes and weight.',
    whatItIs: 'A dual GLP-1 and GIP receptor agonist.',
    studiedFor:
      'FDA-approved for type 2 diabetes (Mounjaro) and weight management (Zepbound), and studied in large clinical trials.',
    howSold:
      'By prescription as a pre-filled pen or vial (Mounjaro, Zepbound). It is also sold by gray-market vendors as a research powder, which is not the approved product.',
    bottomLine:
      'Tirzepatide is an FDA-approved prescription medicine. The approved product comes through a licensed provider and pharmacy, and decisions about it belong with them.',
  },
  hgh: {
    teaser: 'Prescription growth hormone, measured in international units.',
    whatItIs:
      'Recombinant human growth hormone (somatropin), a lab-made copy of a hormone the body produces.',
    studiedFor:
      'FDA-approved by prescription for specific growth hormone deficiencies and certain other conditions. It is measured in international units (IU).',
    howSold:
      'By prescription as a powder or pen for reconstitution. Vial strengths are given in IU.',
    bottomLine:
      'HGH is a prescription medication, and non-medical use is restricted by law in many places. Decisions belong with a licensed provider.',
  },
  hcg: {
    teaser: 'A prescription hormone dosed in international units.',
    whatItIs:
      'Human chorionic gonadotropin, a hormone produced as a medicine. It is dosed in international units (IU).',
    studiedFor:
      'Used in fertility treatment and prescribed in some hormone protocols.',
    howSold:
      'By prescription as a powder for reconstitution, in IU strengths (commonly 5,000 or 10,000 IU).',
    bottomLine:
      'HCG is a prescription medication. Whether it is right for you is a decision for you and a licensed healthcare provider.',
  },
};

/** Slugs that have an education entry, in the order to show in the library. */
export const LEARN_SLUGS = [
  'semaglutide',
  'tirzepatide',
  'retatrutide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'ipamorelin',
  'cjc-1295',
  'sermorelin',
  'hgh',
  'hcg',
];
