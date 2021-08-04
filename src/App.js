import "./App.css";

import React, { useRef } from "react";

import Editor from "@monaco-editor/react";

function App() {
  const monacoRef = useRef(null);

  function handleEditorWillMount(monaco) {
    // here is the monaco instance
    // do something before editor is mounted
    //monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.register({ id: "cql" });
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("cql", {
      tokenizer: {
        root: [
          [/\[error.*/, "custom-error"],
          [/\[notice.*/, "custom-notice"],
          [/\[info.*/, "custom-info"],
          [/\[[a-zA-Z 0-9:]+\]/, "custom-date"],
        ],
      },
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("cqlTheme", {
      base: "vs",
      inherit: false,
      rules: [
        { token: "custom-info", foreground: "808080" },
        { token: "custom-error", foreground: "ff0000", fontStyle: "bold" },
        { token: "custom-notice", foreground: "FFA500" },
        { token: "custom-date", foreground: "008800" },
      ],
    });
    monaco.languages.registerCompletionItemProvider("cql", {
      provideCompletionItems: () => {
        var suggestions = [
          {
            label: "simpleText",
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: "simpleText",
          },
          {
            label: "testing",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "testing(${1:condition})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "ifelse",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "if (${1:condition}) {",
              "\t$0",
              "} else {",
              "\t",
              "}",
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "If-Else Statement",
          },
        ];
        return { suggestions: suggestions };
      },
    });
  }

  function handleEditorDidMount(editor, monaco) {}

  // Register a completion item provider for the new language

  function getCode() {
    return ["library ASF_FHIR version '1.0.0'"].join("\n");
  }
  return (
    <div className="App">
      <Editor
        height="100vh"
        theme="cqlTheme"
        defaultLanguage="cql"
        defaultValue={getCode()}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default App;
