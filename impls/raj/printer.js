const MalType = require("./mal_type");

const pr_str = ast => (ast instanceof MalType ? ast.pr_str() : ast.toString());

module.exports = { pr_str };
