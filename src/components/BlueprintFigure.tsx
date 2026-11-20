import React from 'react';

interface BlueprintFigureProps {
  figId: string;
  title: string;
  caption?: string;
  children: React.ReactNode;
}

export const BlueprintFigure: React.FC<BlueprintFigureProps> = ({ figId, title, caption, children }) => {
  return (
    <figure className="figure-card">
      <div className="figure-head">
        <span className="left">{figId}</span>
        <span className="right">{title}</span>
      </div>
      <div className="figure-body">{children}</div>
      {caption ? <figcaption className="figure-foot">{caption}</figcaption> : null}
    </figure>
  );
};
