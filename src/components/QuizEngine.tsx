import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QuizQuestion } from '../types/curriculum';
import { useProgress } from '../context/ProgressContext';

interface QuizEngineProps {
  lessonKey: string;
  questions: QuizQuestion[];
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ lessonKey, questions }) => {
  const { state, recordQuizScore } = useProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!questions.length) {
    return (
      <div
        style={{
          padding: 24,
          border: '1px solid var(--rule-soft)',
          background: 'var(--bg-surface)',
          color: 'var(--ink-soft)',
        }}
      >
        This lesson does not ship a <code>quiz.json</code> yet. Test yourself using the Exercises section in the lesson text.
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const prevBest = state.quizScores[lessonKey];

  const handleSelect = (q: QuizQuestion, optIdx: number) => {
    if (answers[q.id] !== undefined) return;
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    const nextCorrect = questions.filter((item) => next[item.id] === item.correctIndex).length;
    recordQuizScore(lessonKey, nextCorrect, questions.length);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 16px',
          border: '1px solid var(--ink)',
          background: 'var(--bg-surface)',
          marginBottom: 20,
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <strong style={{ color: 'var(--blueprint)' }}>
            {answeredCount} / {questions.length} ANSWERED
          </strong>
          {' · '}
          <span>
            SCORE: {correctCount} / {questions.length}
          </span>
          {prevBest ? (
            <span style={{ color: 'var(--ink-mute)', marginLeft: 10 }}>
              (Saved: {prevBest.correct}/{prevBest.total})
            </span>
          ) : null}
        </div>
        <button type="button" onClick={() => setAnswers({})} className="bp-btn bp-btn--sm">
          <RotateCcw size={13} aria-hidden="true" />
          <span>Retry Quiz</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {questions.map((q, idx) => {
          const chosen = answers[q.id];
          const isAnswered = chosen !== undefined;
          const isCorrect = chosen === q.correctIndex;

          return (
            <div
              key={q.id}
              style={{
                border: '1px solid var(--rule-soft)',
                background: 'var(--bg)',
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                <span className="bp-chip bp-chip--blue">
                  Q{idx + 1} · {q.stage}
                </span>
                {isAnswered && (
                  <span className={`bp-chip ${isCorrect ? 'bp-chip--ok' : 'bp-chip--warn'}`}>
                    {isCorrect ? 'Correct' : 'Review'}
                  </span>
                )}
              </div>

              <p style={{ fontWeight: 600, marginBottom: 14, color: 'var(--ink)' }}>{q.question}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, optIdx) => {
                  const isThisChosen = chosen === optIdx;
                  const isRightOpt = q.correctIndex === optIdx;

                  let borderColor = 'var(--rule-soft)';
                  let bg = 'var(--bg-surface)';
                  if (isAnswered) {
                    if (isRightOpt) {
                      borderColor = 'var(--success)';
                      bg = 'rgba(22, 122, 77, 0.1)';
                    } else if (isThisChosen) {
                      borderColor = 'var(--danger)';
                      bg = 'rgba(180, 35, 24, 0.1)';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(q, optIdx)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: `1px solid ${borderColor}`,
                        background: bg,
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.96rem',
                        cursor: isAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <span>
                        <strong
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.76rem',
                            marginRight: 10,
                            color: 'var(--blueprint)',
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}.
                        </strong>
                        {opt}
                      </span>
                      {isAnswered && isRightOpt && (
                        <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} aria-hidden="true" />
                      )}
                      {isAnswered && isThisChosen && !isRightOpt && (
                        <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && q.explanation && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--blueprint)'}`,
                    background: 'var(--bg-surface)',
                    fontSize: '0.92rem',
                    color: 'var(--ink-soft)',
                  }}
                >
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
