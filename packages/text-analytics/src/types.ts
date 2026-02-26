// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface WordFrequency { word: string; count: number; frequency: number; }
export interface ReadabilityScore { fleschKincaid: number; avgWordsPerSentence: number; avgSyllablesPerWord: number; }
export interface TextStats { wordCount: number; charCount: number; sentenceCount: number; paragraphCount: number; avgWordLength: number; }
export interface SimilarityResult { score: number; method: string; }
