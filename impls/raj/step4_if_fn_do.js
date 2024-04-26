const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { ns } = require("./core");
const {
  MalList,
  MalSymbol,
  MalVector,
  MalMap,
  MalFunction,
  MalNil,
  MalQuote,
  MalString,
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

  if (ast instanceof MalQuote) {
    return ast.value;
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

const handleFunction = (fun, params) => {
  const [outerEnv, first, ...body] = fun.value;
  const bindings = first.value;
  const env = new Env(outerEnv);
  let i = 0;

  while (i < bindings.length) {
    if (bindings[i].value === "&") {
      env.set(bindings[i + 1].value, new MalList(params.slice(i)), env);
      break;
    }

    env.set(bindings[i].value, EVAL(params[i], env));
    i++;
  }

  const doAst = new MalList([new MalString("do"), ...body]);
  return EVAL(doAst, env);
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
  const pred = EVAL(condition, env).value;
  const falsyValues = [null, false];
  if (falsyValues.some(a => pred === a)) {
    if (falseBranch === undefined) return new MalNil();
    return EVAL(falseBranch, env);
  }

  return EVAL(trueBranch, env);
};

const handleLet = (ast, env) => {
  const [_, bindings, ...body] = ast.value;
  const newEnv = createEnv(bindings.value, env);
  const doAst = new MalList([new MalString("do"), ...body]);
  return EVAL(doAst, newEnv);
};

const handleDef = (ast, env) => {
  const [_, name, body] = ast.value;
  return env.set(name.value, EVAL(body, env));
};

const createFunc = (ast, env) => {
  const [_, params, ...more] = ast.value;
  return new MalFunction([env, params, ...more]);
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;
  const [f] = ast.value;

  switch (f.value) {
    case "def!":
      return handleDef(ast, env);
    case "let*":
      return handleLet(ast, env);
    case "fn*":
      return createFunc(ast, env);
    case "do":
      return handleDo(ast, env);
    case "if":
      return handleIf(ast, env);
    default:
      const [fun, ...params] = eval_ast(ast, env).value;
      if (fun instanceof MalFunction) return handleFunction(fun, params);
      return fun.apply(null, params);
  }
};

const PRINT = ast => pr_str(ast, true);
const rep = (expStr, env) => PRINT(EVAL(READ(expStr), env));
const setupEnv = (env, ns) => {
  Object.entries(ns).forEach(([key, value]) => {
    env.set(key, value);
  });

  return env;
};

const repl = env =>
  rl.question("user> ", input => {
    try {
      console.log(rep(input, env));
    } catch (e) {
      console.log(e.message);
    }
    repl(env);
  });

const main = () => {
  const repl_env = new Env();
  const env = setupEnv(repl_env, ns);
  repl(env);
};

main();
