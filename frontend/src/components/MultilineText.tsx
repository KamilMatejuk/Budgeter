import React from 'react';

interface MultilineTextProps {
  text: string;
}

export default function MultilineText({ text }: MultilineTextProps) {
  let lines = text.split('\\n');
  if (lines.length === 1) {
    lines = text.split('\n');
  }

  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}
