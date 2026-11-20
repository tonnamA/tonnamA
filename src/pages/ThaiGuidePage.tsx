import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LessonMarkdown } from '../components/LessonMarkdown';

export const ThaiGuidePage: React.FC = () => {
  const [md, setMd] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/thai-guide.json')
      .then((r) => r.json() as Promise<{ markdown: string }>)
      .then((d) => setMd(d.markdown));
  }, []);

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)' }}>
            คู่มือหลักสูตร AI Engineering from Scratch (ฉบับภาษาไทย)
          </h1>
          <p className="bp-section-desc">
            เนื้อหาแนะนำหลักสูตรฉบับแปลไทยอย่างเป็นทางการจากไฟล์ <code>i18n/th/README.md</code> ในคลังโค้ดต้นฉบับ
          </p>
        </div>
        <Link to="/learn/00-setup-and-tooling/01-dev-environment" className="bp-btn bp-btn--primary bp-btn--sm">
          เริ่มบทเรียนที่ 1 →
        </Link>
      </div>

      {!md ? (
        <p style={{ fontFamily: 'var(--font-mono)' }}>กำลังโหลดคู่มือภาษาไทย...</p>
      ) : (
        <div
          style={{
            border: '1px solid var(--ink)',
            background: 'var(--bg)',
            padding: '28px',
            maxWidth: '88ch',
          }}
        >
          <LessonMarkdown markdown={md} />
        </div>
      )}
    </div>
  );
};
