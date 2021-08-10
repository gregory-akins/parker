import "./App.css";

import React, { useRef } from "react";

import Editor from "@monaco-editor/react";

function App() {
  const monacoRef = useRef(null);
  const obj = {
    E: {
      relevantPeriod: "relevantPeriod",
    },
  };
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
            message: "Incorrect Version",
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
    function getType(thing, isMember) {
      isMember =
        isMember == undefined
          ? typeof isMember == "boolean"
            ? isMember
            : false
          : false; // Give isMember a default value of false

      switch ((typeof thing).toLowerCase()) {
        case "object":
          return monaco.languages.CompletionItemKind.Class;

        case "function":
          return isMember
            ? monaco.languages.CompletionItemKind.Method
            : monaco.languages.CompletionItemKind.Function;

        default:
          return isMember
            ? monaco.languages.CompletionItemKind.Property
            : monaco.languages.CompletionItemKind.Variable;
      }
    }
    monaco.languages.registerCompletionItemProvider("cql", {
      // Run this function when the period or open parenthesis is typed (and anything after a space)
      triggerCharacters: [".", "("],

      // Function to generate autocompletion results
      provideCompletionItems: function (model, position, token) {
        // Split everything the user has typed on the current line up at each space, and only look at the last word
        var last_chars = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 0,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        var words = last_chars.replace("\t", "").split(" ");
        var active_typing = words[words.length - 1]; // What the user is currently typing (everything after the last space)

        // If the last character typed is a period then we need to look at member objects of the obj object
        var is_member = active_typing.charAt(active_typing.length - 1) == ".";

        // Array of autocompletion results
        var result = [];

        // Used for generic handling between member and non-member objects
        var last_token = obj;
        var prefix = "";

        if (is_member) {
          // Is a member, get a list of all members, and the prefix
          var parents = active_typing
            .substring(0, active_typing.length - 1)
            .split(".");
          last_token = obj[parents[0]];
          prefix = parents[0];

          // Loop through all the parents the current one will have (to generate prefix)
          for (var i = 1; i < parents.length; i++) {
            if (last_token.hasOwnProperty(parents[i])) {
              prefix += "." + parents[i];
              last_token = last_token[parents[i]];
            } else {
              // Not valid
              return result;
            }
          }

          prefix += ".";
        }

        // Get all the child properties of the last token
        for (var prop in last_token) {
          // Do not show properites that begin with "__"
          if (last_token.hasOwnProperty(prop) && !prop.startsWith("__")) {
            // Get the detail type (try-catch) incase object does not have prototype
            var details = "";
            try {
              details = last_token[prop].__proto__.constructor.name;
            } catch (e) {
              details = typeof last_token[prop];
            }

            // Create completion object
            var to_push = {
              label: prefix + prop,
              kind: getType(last_token[prop], is_member),
              detail: details,
              insertText: prop,
            };

            // Change insertText and documentation for functions
            if (to_push.detail.toLowerCase() == "function") {
              to_push.insertText += "(";
              to_push.documentation = last_token[prop].toString().split("{")[0]; // Show function prototype in the documentation popup
            }

            // Add to final results
            result.push(to_push);
          }
        }

        return {
          suggestions: result,
        };
      },
    });
  }

  function handleEditorDidMount(editor, monaco) {}

  // Register a completion item provider for the new language
  const testCql = `library TJCOverall_FHIR4 version '.4.00.000'

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

  define "Long-Term Residential Facility Encounters":
    ["Encounter, Performed": "Care Services in Long-Term Residential Facility"] E
        // By always specifying the attribute involved, filtering is explicit, rather than implicit in the model
        with ["Diagnosis": "Heart Failure"] D
          such that D.prevalencePeriod overlaps before E.relevantPeriod
        where E.relevantPeriod during "Measurement Period"
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
