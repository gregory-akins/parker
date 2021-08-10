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
        root: [],
      },
    });

    monaco.editor.onDidCreateModel(function (model) {
      function validate() {
        var textToValidate = model.getValue();

        // return a list of markers indicating errors to display

        // replace the below with your actual validation code which will build
        // the proper list of markers

        var markers = [
          {
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 20,
            message: "hi there",
          },
        ];

        // change mySpecialLanguage to whatever your language id is
        monaco.editor.setModelMarkers(model, "mySpecialLanguage", markers);
      }

      var handle = null;
      model.onDidChangeContent(() => {
        // debounce
        clearTimeout(handle);
        handle = setTimeout(() => validate(), 500);
      });
      validate();
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
            label: "include",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: ["include (${1:condition}) version () called "].join(
              "\n"
            ),
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
  const testCql = `library TJCOverall_FHIR4 version '4.0.000'

  using FHIR version '4.0.0'

  // NOTE: BTR 2019-07-30: Updated version dependencies
  include FHIRHelpers version '4.0.0' called FHIRHelpers
  include MATGlobalCommonFunctions_FHIR4 version '4.0.000' called Global
  include SupplementalDataElements_FHIR4 version '1.0.0' called SDE

  codesystem "LOINC": 'urn:oid:2.16.840.1.113883.6.1'
  codesystem "CPT:2018": 'urn:oid:2.16.840.1.113883.6.12'
  codesystem "SNOMEDCT:2017-09": 'http://snomed.info/sct/731000124108'  version 'http://snomed.info/sct/731000124108/version/201709'

  valueset "Acute Pharyngitis (1)": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.102.12.1011.1'
  valueset "Acute Pharyngitis (2)": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.102.12.1011.2'
  valueset "Encounter Inpatient SNOMEDCT Value Set": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.666.7.307|20160929'
  valueset "Face-to-Face Interaction": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1004.101.12.1048|MU2%20Update@202016-04-01'
  
  code "Venous foot pump, device (physical object)": '442023007' from "SNOMED-CT"
  `;

  function getCode() {
    return testCql;
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
