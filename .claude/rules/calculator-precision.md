---
name: calculator-precision
description: Enforces precision and verification when editing calculator math — the brand's trust foundation
when: file_matches
match:
  - "lib/calculator.ts"
  - "lib/calculator.test.ts"
  - "app/calculator/**"
  - "data/peptides.ts"
---

# Calculator Precision Rule

When editing any file matching the patterns above, apply these rules:

## 1. The math IS the brand

*"The math doesn't lie"* is BuddyPept's cornerstone phrase. Any error in the calculator is brand-damaging in a way no other code error is. **Triple-check before committing.**

## 2. Verify against known examples

Before committing any change to calculator math, manually verify outputs against these known cases:

- **Semaglutide reconstitution:** 5 mg vial + 2 mL bacteriostatic water → concentration 2.5 mg/mL. Target dose 0.25 mg → 0.1 mL → **10 units on a U-100 syringe**.
- **BPC-157 reconstitution:** 10 mg vial + 5 mL bacteriostatic water → concentration 2 mg/mL (2000 mcg/mL). Target dose 250 mcg → 0.125 mL → **12.5 units on a U-100 syringe**.
- **Tirzepatide reconstitution:** 10 mg vial + 2 mL bacteriostatic water → concentration 5 mg/mL. Target dose 2.5 mg → 0.5 mL → **50 units on a U-100 syringe**.

Cross-check against the prior-art `index.html` implementation at the project root as a sanity reference.

## 3. Pure functions only

Calculator math lives in `lib/calculator.ts` as **pure TypeScript functions** with no side effects, no external dependencies. This makes it trivially testable and reasoned-about.

## 4. Type safety at all unit boundaries

Use branded types or Zod schemas to keep units separate. mg, mL, mcg, IU, and "syringe units" are different conceptual types — never let a function accept a raw `number` where the unit is ambiguous.

Good pattern:
```ts
type Milligrams = number & { __brand: 'mg' };
type Milliliters = number & { __brand: 'mL' };
type Micrograms = number & { __brand: 'mcg' };
type SyringeUnits = number & { __brand: 'units' };
```

## 5. Add a test case for every new path

Any new calculation branch needs a test case in `lib/calculator.test.ts` (once test framework is set up). Include at least one verified-by-hand example for each new path.

## 6. No medical claims in output strings

Calculator outputs MUST be framed as math, not medical recommendations. Always include a disclaimer near any dose output:

> *"This is a math tool, not medical advice. Consult a healthcare professional."*

## 7. Never round silently

If rounding occurs (e.g., 12.5 units → "12.5 units" rather than "12 units"), surface it clearly. Better to show "12.5 units (round to nearest 0.5 on your syringe)" than to silently round and produce an incorrect dose.

## 8. Catch the divide-by-zero / negative-input cases

User input may be malformed (e.g., 0 mL of bac water, negative mg). Validate at the input boundary; refuse to compute on impossible inputs. Throw early with clear error messages.

---

**Why this rule exists:** The math is BuddyPept's promise to its users. Get this wrong and the entire brand collapses. Get it right consistently and you build the trust that anchors everything else.
