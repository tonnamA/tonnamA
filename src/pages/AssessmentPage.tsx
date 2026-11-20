import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useLang } from '../context/LangContext';

interface DiagnosticQ {
  id: number;
  domain: string;
  question: string;
  options: string[];
  correct: number;
  targetPhase: number;
}

const QUESTIONS: DiagnosticQ[] = [
  {
    id: 1,
    domain: 'Python & Tooling',
    question: 'Why do Python AI repositories isolate virtual environments and pin lockfiles?',
    options: [
      'Python syntax breaks outside virtual environments',
      'To prevent dependency version collisions (e.g. PyTorch/CUDA mismatches) across projects',
      'Virtual environments double CPU clock speed',
      'Only virtual environments can read JSON files',
    ],
    correct: 1,
    targetPhase: 0,
  },
  {
    id: 2,
    domain: 'Linear Algebra',
    question: 'What does a single dense neural network layer W·x + b geometrically compute?',
    options: [
      'A non-linear hash digest',
      'A linear transformation (rotation/scaling/shearing) followed by a translation',
      'Sorting the input vector in descending order',
      'Computing prime factors of matrix dimensions',
    ],
    correct: 1,
    targetPhase: 1,
  },
  {
    id: 3,
    domain: 'Classical ML',
    question: 'Why must feature scaling statistics (mean/std) be fit ONLY on the training split?',
    options: [
      'Validation splits contain strings',
      'Fitting on test/validation splits leaks future distribution info into training evaluation',
      'NumPy cannot compute mean on small arrays',
      'StandardScaler fails on even array lengths',
    ],
    correct: 1,
    targetPhase: 2,
  },
  {
    id: 4,
    domain: 'Deep Learning',
    question: 'What causes gradients to vanish in deep networks without residual connections or ReLU?',
    options: [
      'Repeated multiplication of small derivatives (< 1) across many layers during backprop',
      'Using float32 instead of strings',
      'Excessive batch size on validation sets',
      'Too many GPU fans running',
    ],
    correct: 0,
    targetPhase: 3,
  },
  {
    id: 5,
    domain: 'Transformers',
    question: 'Why is Q·Kᵀ divided by √d_k inside scaled dot-product attention?',
    options: [
      'To force negative probabilities',
      'To keep dot-product variance near 1 so softmax does not saturate into tiny gradients',
      'To convert float16 to integer tokens',
      'To double the context window automatically',
    ],
    correct: 1,
    targetPhase: 7,
  },
  {
    id: 6,
    domain: 'LLMs from Scratch',
    question: 'During autoregressive token generation, what does the KV cache store?',
    options: [
      'The training dataset gradients',
      'Previously computed Key and Value tensors so prior tokens are not recomputed each step',
      'System environment variables',
      'BPE merge priority rules',
    ],
    correct: 1,
    targetPhase: 10,
  },
  {
    id: 7,
    domain: 'RAG & Retrieval',
    question: 'Why does hybrid retrieval combine BM25 sparse search with dense embeddings?',
    options: [
      'Dense embeddings always fail on English text',
      'Exact IDs, error codes, and rare terms match well in BM25 while dense vectors capture semantic meaning',
      'BM25 requires a GPU cluster',
      'Hybrid search removes the need for chunking',
    ],
    correct: 1,
    targetPhase: 11,
  },
  {
    id: 8,
    domain: 'Protocols (MCP)',
    question: 'How should an AI gateway treat tool descriptions and annotations supplied by an external MCP server?',
    options: [
      'As trusted system instructions that override policy',
      'As untrusted data susceptible to tool poisoning unless verified and bounded',
      'Automatically executed without user consent',
      'Compiled into C++ binaries',
    ],
    correct: 1,
    targetPhase: 13,
  },
  {
    id: 9,
    domain: 'Agent Engineering',
    question: 'What stops a ReAct agent loop from burning infinite tokens on a broken tool?',
    options: [
      'Increasing temperature to 2.0',
      'Explicit iteration caps, token budgets, stop conditions, and error-recovery thresholds',
      'Removing system prompts entirely',
      'Disabling JSON validation',
    ],
    correct: 1,
    targetPhase: 14,
  },
  {
    id: 10,
    domain: 'Production Serving',
    question: 'What memory bottleneck does PagedAttention solve during high-concurrency LLM serving?',
    options: [
      'CPU L1 cache misses during tokenization',
      'Fragmentation and over-allocation of contiguous GPU HBM blocks for variable-length KV caches',
      'Disk read latency on CSV files',
      'Browser WebSocket handshake delays',
    ],
    correct: 1,
    targetPhase: 17,
  },
];

export const AssessmentPage: React.FC = () => {
  const { lang } = useLang();
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredAll = Object.keys(answers).length === QUESTIONS.length;
  const score = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;

  const getRecommendation = () => {
    if (score <= 2) {
      return {
        phaseDir: '00-setup-and-tooling',
        lessonDir: '01-dev-environment',
        title: 'Phase 0 — Setup & Math Foundations (~306 hours)',
        desc: 'Start at the beginning: set up a clean Python/TS/Rust environment and build linear algebra & calculus intuition from raw code.',
      };
    }
    if (score <= 4) {
      return {
        phaseDir: '01-math-foundations',
        lessonDir: '01-linear-algebra-intuition',
        title: 'Phase 1 — Math Foundations (~270 hours)',
        desc: 'You know programming basics. Lock down vectors, autodiff, and classical ML before implementing neural nets.',
      };
    }
    if (score <= 6) {
      return {
        phaseDir: '03-deep-learning-core',
        lessonDir: '01-the-perceptron',
        title: 'Phase 3 — Deep Learning Core (~200 hours)',
        desc: 'Jump straight into building perceptrons, backprop, optimizers, and then attention & Transformers from scratch.',
      };
    }
    if (score <= 8) {
      return {
        phaseDir: '10-llms-from-scratch',
        lessonDir: '01-tokenizers',
        title: 'Phase 10 — LLMs from Scratch & RAG (~100 hours)',
        desc: 'Strong ML core! Focus on BPE tokenizers, GPT pretraining, KV caching, and production RAG evaluation.',
      };
    }
    return {
      phaseDir: '14-agent-engineering',
      lessonDir: '01-the-agent-loop',
      title: 'Phase 14 — Agent Engineering & Serving (~60 hours)',
      desc: 'Senior track: focus on ReAct harnesses, MCP security, multi-agent swarms, PagedAttention serving, and capstones.',
    };
  };

  const rec = getRecommendation();

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'แบบทดสอบวัดระดับเพื่อเลือกจุดเริ่มต้น' : 'Find Your Starting Level'}
          </h1>
          <p className="bp-section-desc">
            Answer 10 calibrated engineering questions from tooling up to LLM serving to get an exact phase recommendation.
          </p>
        </div>
        <button type="button" onClick={() => setAnswers({})} className="bp-btn bp-btn--sm">
          <RotateCcw size={13} aria-hidden="true" />
          <span>Reset Answers</span>
        </button>
      </div>

      {answeredAll && (
        <div
          style={{
            border: '2px solid var(--blueprint)',
            background: 'var(--blueprint-tint)',
            boxShadow: 'var(--shadow-hard)',
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h2 style={{ fontSize: '2rem', color: 'var(--ink)', marginBottom: 8 }}>{rec.title}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="bp-chip bp-chip--blue">
              DIAGNOSTIC RESULT · {score} / {QUESTIONS.length} CORRECT
            </span>
          </div>
          <p style={{ marginBottom: 16, maxWidth: '68ch' }}>{rec.desc}</p>
          <Link to={`/learn/${rec.phaseDir}/${rec.lessonDir}`} className="bp-btn bp-btn--primary">
            Start Recommended Lesson →
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {QUESTIONS.map((q) => {
          const chosen = answers[q.id];
          return (
            <div key={q.id} style={{ border: '1px solid var(--rule-soft)', background: 'var(--bg)', padding: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--blueprint)', marginRight: 8 }}>
                  Q{String(q.id).padStart(2, '0')}
                </span>
                {q.question}
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-mute)', marginBottom: 12 }}>
                {q.domain} · Target Phase {q.targetPhase}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, idx) => {
                  const selected = chosen === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: idx }))}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: `1px solid ${selected ? 'var(--blueprint)' : 'var(--rule-soft)'}`,
                        background: selected ? 'var(--blueprint-tint)' : 'var(--bg-surface)',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                      }}
                    >
                      <strong style={{ fontFamily: 'var(--font-mono)', marginRight: 10, color: 'var(--blueprint)' }}>
                        {String.fromCharCode(65 + idx)}.
                      </strong>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
