---
title: "When the Workflow Is Clear but the Interface Is Not"
summary: "Why knowing the process is not enough when a skill still receives vague inputs and produces vague outputs."
date: "2026-07-10"
topic: "Architecture & Design"
tags: [Agentic Systems, Interface Design, Workflow Design]
order: 1
draft: false
---

# When the Workflow Is Clear but the Interface Is Not

A few days ago, I ran into a frustrating gap. I understood the workflow. I could describe the problem, the constraints around it, and the difficult situation I was trying to escape. Yet when I tried to encode the solution as a reusable skill, the work remained surprisingly hard.

The obstacle was no longer the process itself. It was the interface around the process.

## Knowing the path is not the same as being able to walk it

A workflow is usually described as a sequence:

1. Understand the problem.
2. Inspect the current state.
3. Choose an approach.
4. Make the change.
5. Verify the result.

This is useful as a map, but it is not yet an executable contract. Each step hides questions that the workflow does not answer:

- What evidence is sufficient to say the problem is understood?
- Which parts of the current state matter?
- What form should a proposed approach take?
- What exactly counts as a verified result?

A human can often cross these gaps with intuition. A reusable skill cannot rely on the same unspoken judgment. It needs explicit boundaries.

## The three ambiguous boundaries

The difficulty tends to concentrate around three interfaces.

| Boundary | Missing question | Typical failure |
| --- | --- | --- |
| Trigger | When should this skill take control? | It activates too early, too late, or for the wrong problem. |
| Input | What information must already exist? | The skill spends most of its effort guessing context. |
| Output | What must be true when it finishes? | The result sounds reasonable but cannot drive the next step. |

These ambiguities compound. An unclear trigger admits the wrong task. Vague input forces hidden assumptions. A loose output contract then makes it impossible to distinguish completion from a plausible-looking response.

Adding more instructions does not necessarily fix this. A longer prompt can describe more behavior while leaving the interface just as uncertain.

## A skill should expose a contract

A more useful skill definition begins with a narrow protocol rather than a broad promise.

```yaml
trigger:
  use_when: the target behavior and affected surface are known
  refuse_when: the request is still exploratory

input:
  goal: one observable outcome
  context: relevant files, state, or evidence
  constraints: boundaries that must not change
  acceptance: checks that can prove completion

output:
  decision: the chosen action and its reason
  artifacts: concrete files, changes, or commands
  assumptions: unresolved facts that influenced the result
  next_step: one executable continuation

stop_when:
  - acceptance checks pass
  - a named external dependency blocks progress
```

The exact schema is less important than the discipline behind it. Inputs should reduce interpretation. Outputs should create leverage for the next operation. Stop conditions should prevent the skill from drifting into endless explanation.

## Process knowledge and interface knowledge are different assets

This distinction changed how I think about reusable automation.

Process knowledge explains *what usually happens*. Interface knowledge explains *what must be supplied, what may be assumed, and what will be returned*. A skill needs both.

Without process knowledge, the skill is shallow. Without interface knowledge, it is unpredictable.

The most reusable part of a skill may therefore not be its internal reasoning. It may be the translation layer at its edges: normalization of messy input, validation of prerequisites, and production of an output that another person or tool can actually consume.

## A practical test

Before turning a workflow into a skill, I now ask four questions:

1. Can I show one valid input and one invalid input?
2. Can I describe the output without using words such as *helpful*, *good*, or *complete*?
3. Can another step consume the result without reinterpreting it?
4. Can the skill explain why it stopped?

If these questions are difficult to answer, the workflow probably needs a clearer interface before it needs more automation.

## Closing note

Knowing the flow is necessary, but it is not sufficient. The hard part often begins after the flow is known: turning tacit judgment into explicit contracts.

A skill does not remove ambiguity by being named. It becomes useful when its boundaries make ambiguity visible, limited, and testable.
