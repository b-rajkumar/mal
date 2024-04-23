const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalList, MalSymbol, MalVector, MalMap } = require("./types");

const rl = readline.createInterface({ input, output });
const READ = str => read_str(str);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const symbol = ast.value;
    const f = env[symbol];
    if (f === undefined) return ast;
    return f;
  }

  if (ast instanceof MalList) {
    return new MalList(ast.value.map(e => EVAL(e, env)));
  }

  if (ast instanceof MalVector) {
    return new MalVector(ast.value.map(e => EVAL(e, env)));
  }

  if (ast instanceof MalMap) {
    const entriesIterator = ast.value.entries();
    const evaluatedMap = [...entriesIterator].reduce((map, [key, value]) => {
      const evaluatedKey = EVAL(key, env);
      const evaluatedValue = EVAL(value, env);

      return map.set(evaluatedKey, evaluatedValue);
    }, new Map());

    return new MalMap(evaluatedMap);
  }

  return ast;
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;

  const [f, ...params] = eval_ast(ast, env).value;

  return f.apply(null, params);
};

const PRINT = ast => pr_str(ast);
const rep = expStr => PRINT(EVAL(READ(expStr), repl_env));

const repl_env = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

const repl = () =>
  rl.question("user> ", input => {
    try {
      console.log(rep(input, repl_env));
    } catch (e) {
      console.log(e);
    }
    repl();
  });

repl();
