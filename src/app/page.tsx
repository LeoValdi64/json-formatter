"use client";

import { useState, useCallback, useEffect } from "react";

// Syntax highlighting colors for dark theme
const syntaxColors = {
  key: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  boolean: "#569cd6",
  null: "#569cd6",
  bracket: "#ffd700",
  brace: "#da70d6",
  comma: "#d4d4d4",
  colon: "#d4d4d4",
};

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let color = syntaxColors.number;
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            color = syntaxColors.key;
            match = match.replace(/"/g, '"').replace(/:$/, '":');
          } else {
            color = syntaxColors.string;
          }
        } else if (/true|false/.test(match)) {
          color = syntaxColors.boolean;
        } else if (/null/.test(match)) {
          color = syntaxColors.null;
        }
        return `<span style="color:${color}">${match}</span>`;
      }
    )
    .replace(/([{}])/g, `<span style="color:${syntaxColors.brace}">$1</span>`)
    .replace(
      /([[\]])/g,
      `<span style="color:${syntaxColors.bracket}">$1</span>`
    );
}

function getErrorLineNumber(error: SyntaxError, input: string): number | null {
  const positionMatch = error.message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const lines = input.substring(0, position).split("\n");
    return lines.length;
  }

  const lineMatch = error.message.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return parseInt(lineMatch[1], 10);
  }

  return null;
}

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJSON = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setErrorLine(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
      setErrorLine(null);
    } catch (e) {
      const syntaxError = e as SyntaxError;
      const line = getErrorLineNumber(syntaxError, input);
      setError(syntaxError.message);
      setErrorLine(line);
      setOutput("");
    }
  }, [input, indentSize]);

  const minifyJSON = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setErrorLine(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      setErrorLine(null);
    } catch (e) {
      const syntaxError = e as SyntaxError;
      const line = getErrorLineNumber(syntaxError, input);
      setError(syntaxError.message);
      setErrorLine(line);
      setOutput("");
    }
  }, [input]);

  const validateJSON = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter some JSON to validate");
      setErrorLine(null);
      return;
    }

    try {
      JSON.parse(input);
      setError(null);
      setErrorLine(null);
      alert("✅ Valid JSON!");
    } catch (e) {
      const syntaxError = e as SyntaxError;
      const line = getErrorLineNumber(syntaxError, input);
      setError(syntaxError.message);
      setErrorLine(line);
    }
  }, [input]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const clearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setErrorLine(null);
  }, []);

  // Keyboard shortcut: Ctrl+Enter to format
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        formatJSON();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [formatJSON]);

  const lineNumbers = output
    ? output.split("\n").map((_, i) => i + 1)
    : input
    ? input.split("\n").map((_, i) => i + 1)
    : [];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#252526] border-b border-[#3c3c3c] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{"{ }"}</span>
            <h1 className="text-xl font-semibold">JSON Formatter</h1>
          </div>
          <div className="text-sm text-gray-400">
            Press <kbd className="px-2 py-1 bg-[#3c3c3c] rounded text-xs">Ctrl</kbd> +{" "}
            <kbd className="px-2 py-1 bg-[#3c3c3c] rounded text-xs">Enter</kbd> to format
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={formatJSON}
              className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded font-medium transition-colors"
            >
              Format / Beautify
            </button>
            <button
              onClick={minifyJSON}
              className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded font-medium transition-colors"
            >
              Minify
            </button>
            <button
              onClick={validateJSON}
              className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded font-medium transition-colors"
            >
              Validate
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded font-medium transition-colors"
            >
              Clear
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-400">Indent:</label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="bg-[#3c3c3c] text-white rounded px-2 py-1 text-sm border border-[#5c5c5c]"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#5a1d1d] border border-[#f14c4c] rounded text-[#f14c4c]">
              <span className="font-medium">Error:</span> {error}
              {errorLine && (
                <span className="ml-2 text-[#f48771]">(Line {errorLine})</span>
              )}
            </div>
          )}

          {/* Editor Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-2 rounded-t border border-b-0 border-[#3c3c3c]">
                <span className="text-sm font-medium text-gray-300">Input</span>
                <span className="text-xs text-gray-500">
                  {input.length} characters
                </span>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your JSON here..."
                  className="w-full h-[500px] p-4 bg-[#1e1e1e] text-gray-100 font-mono text-sm border border-[#3c3c3c] rounded-b resize-none focus:outline-none focus:border-[#0e639c]"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-2 rounded-t border border-b-0 border-[#3c3c3c]">
                <span className="text-sm font-medium text-gray-300">Output</span>
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    output
                      ? "bg-[#0e639c] hover:bg-[#1177bb] text-white"
                      : "bg-[#3c3c3c] text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded-b overflow-auto h-[500px]">
                {output ? (
                  <div className="flex">
                    {/* Line Numbers */}
                    <div className="flex-shrink-0 bg-[#252526] text-gray-500 text-right py-4 px-2 font-mono text-sm select-none border-r border-[#3c3c3c]">
                      {lineNumbers.map((num) => (
                        <div key={num} className="leading-5">
                          {num}
                        </div>
                      ))}
                    </div>
                    {/* Code */}
                    <pre
                      className="flex-1 p-4 font-mono text-sm overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(output),
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {error
                      ? "Fix the error to see output"
                      : "Formatted JSON will appear here"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sample JSON */}
          <div className="mt-6">
            <button
              onClick={() =>
                setInput(
                  JSON.stringify(
                    {
                      name: "John Doe",
                      age: 30,
                      email: "john@example.com",
                      isActive: true,
                      roles: ["admin", "user"],
                      address: {
                        street: "123 Main St",
                        city: "New York",
                        country: "USA",
                      },
                      metadata: null,
                    },
                    null,
                    0
                  )
                )
              }
              className="text-sm text-[#0e639c] hover:text-[#1177bb] underline"
            >
              Load sample JSON
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#252526] border-t border-[#3c3c3c] px-6 py-3">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          JSON Formatter — Format, validate, and beautify your JSON data
        </div>
      </footer>
    </div>
  );
}
