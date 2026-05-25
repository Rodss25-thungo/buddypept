# ADR 001: Progressive Web App, not native or React Native

**Status:** Accepted
**Date:** 2026-05-17

## Context

BuddyPept needs to be a mobile-first app for peptide newcomers. The founder is solo and non-technical, building with AI assistance, with a hard budget constraint of <$50/month infrastructure for the first year.

The decision was between: native iOS+Android (Swift/Kotlin), React Native + Expo, Flutter, or PWA (Progressive Web App).

## Decision

**Build BuddyPept as a PWA using Next.js, hosted at buddypept.app.**

Users can install the PWA to their home screen on iOS and Android, where it behaves like a native app. The same codebase serves browser users and installed users.

## Alternatives considered

- **Native (Swift + Kotlin):** Rejected. Two codebases, far too much complexity for a solo non-technical founder.
- **React Native + Expo:** Considered. Cross-platform with one codebase. Rejected for MVP because: (1) app store review delays slow iteration, (2) requires more native build pipeline knowledge, (3) Vercel/serverless backend integration is less seamless than with Next.js web.
- **Flutter:** Rejected. Dart has significantly less AI training data than JavaScript/TypeScript. Claude Code is meaningfully better at Next.js than Flutter.

## Consequences

**Positive:**
- One codebase, one deployment, one mental model
- Instant updates (no app store review)
- Maximum AI-assisted development reliability (Next.js + TS has the most training data of any stack)
- Domain buddypept.app IS the install URL
- Vercel free tier hosts it indefinitely at MVP scale

**Negative:**
- Cannot appear in App Store / Play Store at launch
- iOS PWA install flow is less obvious than Android's
- Some native APIs (deep haptics, advanced push notifications) are unavailable on iOS PWAs

**Trade-offs accepted:**
- App Store visibility is deferred to Phase 3. When we want native distribution, we wrap the existing PWA in Capacitor, no rewrite required.
