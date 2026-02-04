"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface JsonError {
  message: string;
  line: number | null;
  column: number | null;
}

function getErrorLocation(
  jsonString: string,
  error: SyntaxError
): { line: number; column: number } | null {
  const match = error.message.match(/position\s+(\d+)/i);
  if (!match) return null;

  const position = parseInt(match[1], 10);
  let line = 1;
  let column = 1;
  let currentPos = 0;

  for (const char of jsonString) {
    if (currentPos >= position) break;
    if (char === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    currentPos++;
  }

  return { line, column };
}

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<JsonError | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightedOutput, setHighlightedOutput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseAndValidate = useCallback(
    (jsonString: string): { parsed: unknown; error: JsonError | null } => {
      if (!jsonString.trim()) {
        return { parsed: null, error: null };
      }

      try {
        const parsed = JSON.parse(jsonString);
        return { parsed, error: null };
      } catch (e) {
        const syntaxError = e as SyntaxError;
        const location = getErrorLocation(jsonString, syntaxError);
        return {
          parsed: null,
          error: {
            message: syntaxError.message,
            line: location?.line ?? null,
            column: location?.column ?? null,
          },
        };
      }
    },
    []
  );

  const formatJson = useCallback(
    (minify = false) => {
      const { parsed, error: parseError } = parseAndValidate(input);

      if (parseError) {
        setError(parseError);
        setOutput("");
        setHighlightedOutput("");
        return;
      }

      if (parsed === null) {
        setError(null);
        setOutput("");
        setHighlightedOutput("");
        return;
      }

      setError(null);
      const formatted = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setHighlightedOutput(syntaxHighlight(formatted));
    },
    [input, parseAndValidate]
  );

  const handleFormat = useCallback(() => formatJson(false), [formatJson]);
  const handleMinify = useCallback(() => formatJson(true), [formatJson]);

  const handleCopy = useCallback(async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setHighlightedOutput("");
    setError(null);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleFormat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFormat]);

  const lineNumbers = output
    ? output.split("\n").map((_, i) => i + 1)
    : [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            JSON Formatter & Validator
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Paste JSON to format, beautify, minify, or validate.{" "}
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl</kbd>
            {" + "}
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Enter</kbd>
            {" to format"}
          </p>
        </header>

        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            onClick={handleFormat}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            Format / Beautify
          </button>
          <button
            onClick={handleMinify}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            Minify
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            {copied ? "Copied!" : "Copy Output"}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-400">Invalid JSON</h3>
                <p className="text-red-300 text-sm mt-1">{error.message}</p>
                {error.line !== null && (
                  <p className="text-red-300 text-sm mt-1">
                    Line {error.line}
                    {error.column !== null && `, Column ${error.column}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2">
              Input JSON
            </label>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste your JSON here...\n\nExample:\n{"name": "John", "age": 30}'
              className="flex-1 min-h-[400px] md:min-h-[500px] p-4 bg-[#161b22] border border-gray-700 rounded-lg font-mono text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2">
              Formatted Output
            </label>
            <div className="flex-1 min-h-[400px] md:min-h-[500px] bg-[#161b22] border border-gray-700 rounded-lg overflow-hidden">
              {highlightedOutput ? (
                <div className="h-full overflow-auto">
                  <div className="flex font-mono text-sm">
                    <div className="flex-shrink-0 py-4 px-2 bg-[#0d1117] text-gray-500 text-right select-none border-r border-gray-700">
                      {lineNumbers.map((num) => (
                        <div key={num} className="leading-6 px-2">
                          {num}
                        </div>
                      ))}
                    </div>
                    <pre
                      className="flex-1 p-4 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: highlightedOutput }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Formatted JSON will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            All processing happens in your browser. No data is sent to any
            server.
          </p>
        </footer>
      </div>
    </div>
  );
}
