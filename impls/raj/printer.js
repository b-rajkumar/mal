const MalType = require("./mal_type");

const pr_str = (ast, printReadably) => {
  if (ast === undefined) return;
  return ast instanceof MalType ? ast.pr_str(printReadably) : ast.toString();
};

module.exports = { pr_str };
