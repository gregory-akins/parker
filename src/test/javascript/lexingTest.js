let assert = require("assert");
let parserFacade = require("../../main-generated/javascript/ParserFacade.js");
let CqlLexer = require("../../main-generated/javascript/CqlLexer.js").CqlLexer;

function checkToken(tokens, index, typeName, column, text) {
  it("should have " + typeName + " in position " + index, function () {
    console.log(tokens[index].type);
    assert.equal(tokens[index].type, CqlLexer[typeName]);
    assert.equal(tokens[index].column, column);
    assert.equal(tokens[index].text, text);
  });
}

describe("Basic lexing", function () {
  let tokens = parserFacade.getTokens("library TJCOverallFHIR4  '4.0.000'");
  it("should return 7 tokens", function () {
    assert.equal(tokens.length, 7);
  });
  checkToken(tokens, 0, "IDENTIFIER", 0, "library");
});
