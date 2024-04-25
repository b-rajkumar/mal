const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalList, MalSymbol, MalVector, MalMap, MalValue } = require("./types");
const Env = require("./env");

const rl = readline.createInterface({ input, output });
const READ = str => read_str(str);
const createEnv = (bindings, outerEnv) => {
  const env = new Env(outerEnv);

  for (let i = 0; i < bindings.length; i += 2) {
    const key = bindings[i].value;
    const value = EVAL(bindings[i + 1], env);
    env.set(key, value);
  }

  return env;
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const symbol = ast.value;
    const f = env.get(symbol);
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
    const evaluatedMap = ast.value.reduce((map, [key, value]) => {
      const evaluatedKey = EVAL(key, env);
      const evaluatedValue = EVAL(value, env);

      return [...map, [evaluatedKey, evaluatedValue]];
    }, []);

    return new MalMap(evaluatedMap);
  }

  return ast;
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;
  const [f, a, b] = ast.value;

  switch (f.value) {
    case "def!":
      return env.set(a.value, EVAL(b, env));
    case "let*":
      const newEnv = createEnv(a.value, env);
      return EVAL(b, newEnv);
    default:
      const [fun, ...params] = eval_ast(ast, env).value;
      return fun.apply(null, params);
  }
};

const PRINT = ast => pr_str(ast);
const rep = expStr => PRINT(EVAL(READ(expStr), repl_env));

const repl_env = new Env();
repl_env.set("+", (a, b) => new MalValue(a.value + b.value));
repl_env.set("-", (a, b) => new MalValue(a.value - b.value));
repl_env.set("*", (a, b) => new MalValue(a.value * b.value));
repl_env.set("/", (a, b) => new MalValue(a.value / b.value));

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
