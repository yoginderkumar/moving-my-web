<img src="banner.png" alt="moving-my-web" width="100%" />

A [Claude Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) for crafting production-grade web motion — hero entrances, scroll-triggered reveals, stagger/choreography, micro-interactions, page transitions, and scrollytelling — using plain CSS, native scroll-driven CSS, GSAP, or Motion depending on what the moment actually needs.

Point Claude at a landing page or app and ask for "animations," "motion," a page that "feels premium" or "like an Awwwards site," scroll effects, hover/micro-interactions, or parallax, and it will:

1. **Discover** — ask what the product is, any brand/theme direction, and any reference sites for the motion specifically.
2. **Research** — read your actual codebase (stack, existing design tokens, what's already animated) and, if you named a reference, describe concretely what it's doing.
3. **Propose** — a plain-language plan per section (what animates, why, how it's triggered/choreographed, which tool) before writing any code.
4. **Execute** — build against the approved plan, with performance (`references/performance.md`) and accessibility (`references/accessibility.md`, always respecting `prefers-reduced-motion`) baked in throughout, not bolted on after.

## What's in here

- **`SKILL.md`** — the skill itself: the workflow above, plus how to choose CSS vs. native scroll-driven CSS vs. GSAP vs. Motion for a given effect.
- **`references/`** — loaded as needed, not all at once: animation principles, a tool decision framework, CSS-only patterns, GSAP patterns, performance rules, and accessibility rules.
- **`snippets/`** — copy-paste starting points (CSS: stagger, scroll-reveal, marquee, text-mask reveal, easing tokens, magnetic hover button; GSAP: hero timeline, scroll-trigger reveal, pinned scroll section, SVG path draw, a React cleanup pattern).

## Installing it

**Claude Code / Claude (Cowork) — as a personal or project skill:**

Clone this repo into your skills directory (or wherever your setup reads local skills from) and Claude will pick it up automatically once the containing folder is on Claude's skill path:

```bash
git clone https://github.com/<your-username>/moving-my-web.git
```

Consult your client's docs for the exact skills directory — it varies (`~/.claude/skills/`, a project's `.claude/skills/`, or an org-level sync), and the mechanism continues to evolve.

**As a plugin marketplace entry:** if you want this installable via `/plugin marketplace add`, wrap it in a plugin manifest per the [plugin docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) — this repo ships the skill itself, not a marketplace wrapper.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, adapt it.