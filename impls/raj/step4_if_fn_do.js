const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const {
  MalList,
  MalSymbol,
  MalVector,
  MalMap,
  MalFunction,
  MalNil,
  MalBool,
} = require("./types");
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

const handleFunction = (fun, params, outerEnv) => {
  const [first, body] = fun.value;
  const bindings = first.value;
  const env = new Env(outerEnv);

  for (let i = 0; i < bindings.length; i++) {
    env.set(bindings[i].value, EVAL(params[i], outerEnv));
  }

  return EVAL(body, env);
};

const handleDo = (ast, env) => {
  const [_, ...rest] = ast.value;
  let lastExpResult = new MalNil();
  rest.forEach(element => {
    lastExpResult = EVAL(element, env);
  });

  return lastExpResult;
};

const handleIf = (ast, env) => {
  const [_, condition, trueBranch, falseBranch] = ast.value;
  if (EVAL(condition, env).value) return EVAL(trueBranch, env);

  return EVAL(falseBranch, env);
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
    case "fn*":
      return new MalFunction([a, b]);
    case "do":
      return handleDo(ast, env);
    case "if":
      return handleIf(ast, env);
    default:
      const [fun, ...params] = eval_ast(ast, env).value;
      if (fun instanceof MalFunction) return handleFunction(fun, params, env);
      return fun.apply(null, params);
  }
};

const PRINT = ast => pr_str(ast);
const rep = expStr => PRINT(EVAL(READ(expStr), repl_env));

const repl_env = new Env();
repl_env.set("+", (a, b) => a + b);
repl_env.set("-", (a, b) => a - b);
repl_env.set("*", (a, b) => a * b);
repl_env.set("/", (a, b) => a / b);

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
