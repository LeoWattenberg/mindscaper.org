---
title: "Is Soundscaper an Audacity fork?"
description: "Soundscaper looks a lot like Audacity, but inexplicably runs in a browser. If this feels weird to you, you’re not alone. "
date: 2026-09-26
# Update the date before publishing.
language: en
draft: true
---

Soundscaper looks a lot like Audacity, but inexplicably runs in a browser. If this feels weird to you, you’re not alone. 

In a very strict sense, Soundscaper is not an Audacity fork. Audacity is fundamentally a C++ app in a Qt skin, using PortAudio as its audio provider. Soundscaper uses none of these things, it’s written in Typescript, uses [Audacity’s design system prototype](https://github.com/DilsonsPickles/audacity-design-system) as UI, and uses your browser as its audio provider. 

This has several benefits for Soundscaper: While PortAudio hasn’t seen a major update in half a decade and struggles with various sound configurations, browsers typically have much better compatibility. While Audacity is using a 25-year old codebase with a lot of tech debt, Soundscaper is mere months old.

However, Soundscaper isn’t built entirely from scratch: The UI *is* Audacity’s UI, built directly from the design prototype instead of translated to Qt first. Various algorithms, especially effects, have been directly ported, and some even are simply compiled from Audacity directly into WASM modules. 

There is a *lot* of Audacity heritage inside Soundscaper at the end of the day, so calling Soundscaper an "Audacity fork" is justified to some degree as well. 