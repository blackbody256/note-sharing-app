
// src/components/MarkdownPreview.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function MarkdownPreview({ content, backgroundColor }) {
  return (
    <div style={getStyles(backgroundColor).container}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block styling
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: '8px',
                  fontSize: '13px',
                  margin: '16px 0'
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} style={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          },
          // Custom styling for other elements
          h1: ({ children }) => <h1 style={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 style={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 style={styles.h3}>{children}</h3>,
          p: ({ children }) => <p style={styles.paragraph}>{children}</p>,
          ul: ({ children }) => <ul style={styles.list}>{children}</ul>,
          ol: ({ children }) => <ol style={styles.list}>{children}</ol>,
          li: ({ children }) => <li style={styles.listItem}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={styles.blockquote}>{children}</blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} style={styles.link} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th style={styles.th}>{children}</th>,
          td: ({ children }) => <td style={styles.td}>{children}</td>,
          hr: () => <hr style={styles.hr} />,
          img: ({ src, alt }) => (
            <img src={src} alt={alt} style={styles.image} />
          ),
          input: ({ checked, type }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  style={styles.checkbox}
                />
              );
            }
            return null;
          },
        }}
      >
        {content || '*No content*'}
      </ReactMarkdown>
    </div>
  );
}

// Dynamic styles based on note color
function getStyles(backgroundColor) {
  return {
    container: {
      lineHeight: '1.6',
      color: '#202124',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
    }
  };
}

// Markdown element styles
const styles = {
  h1: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '24px',
    marginBottom: '16px',
    color: '#202124',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: '600',
    marginTop: '20px',
    marginBottom: '12px',
    color: '#202124',
  },
  h3: {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '10px',
    color: '#202124',
  },
  paragraph: {
    marginBottom: '12px',
    fontSize: '14px',
    color: '#5f6368',
  },
  list: {
    marginBottom: '12px',
    paddingLeft: '24px',
  },
  listItem: {
    marginBottom: '6px',
    fontSize: '14px',
    color: '#5f6368',
  },
  blockquote: {
    borderLeft: '4px solid #667eea',
    paddingLeft: '16px',
    margin: '16px 0',
    fontStyle: 'italic',
    color: '#5f6368',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: '12px 16px',
    borderRadius: '4px',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.2s',
  },
  inlineCode: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#d73a49',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: '10px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #667eea',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #e0e0e0',
  },
  hr: {
    border: 'none',
    borderTop: '2px solid #e0e0e0',
    margin: '24px 0',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '12px',
    marginBottom: '12px',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
};

export default MarkdownPreview;
