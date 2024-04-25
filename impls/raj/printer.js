const MalType = require("./mal_type");

const pr_str = (ast, printReadably) => {
  if (ast === undefined) return;
  let rawString = ast instanceof MalType ? ast.pr_str() : ast.toString();
  if (printReadably) return rawString;
  return rawString
    .replaceAll("\n", "\\n")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
};

module.exports = { pr_str };
