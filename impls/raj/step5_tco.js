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
    const evaluatedMap = ast.value.map(([k, v]) => [
      EVAL(k, env),
      EVAL(v, env),
    ]);
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

  return [doAst, env];
};

const handleDo = (ast, env) => {
  const [_, ...rest] = ast.value;
  let lastExpResult = rest.pop();
  rest.forEach(element => EVAL(element, env));

  return lastExpResult;
};

const handleIf = (ast, env) => {
  const [_, condition, trueBranch, falseBranch] = ast.value;
  const pred = EVAL(condition, env).value;
  const falsyValues = [null, false];
  if (falsyValues.some(a => pred === a)) {
    if (falseBranch === undefined) return new MalNil();
    return falseBranch;
  }

  return trueBranch;
};

const handleLet = (ast, env) => {
  const [_, bindings, ...body] = ast.value;
  const newEnv = createEnv(bindings.value, env);
  const doAst = new MalList([new MalString("do"), ...body]);
  return [doAst, newEnv];
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
  let lastAst = ast;
  let updatedEnv = env;

  while (lastAst instanceof MalList) {
    if (lastAst.isEmpty()) return lastAst;
    const [f] = lastAst.value;
    switch (f.value) {
      case "def!":
        return handleDef(lastAst, updatedEnv);
      case "let*":
        [lastAst, updatedEnv] = handleLet(lastAst, updatedEnv);
        break;
      case "fn*":
        return createFunc(lastAst, updatedEnv);
      case "do":
        lastAst = handleDo(lastAst, updatedEnv);
        break;
      case "if":
        lastAst = handleIf(lastAst, updatedEnv);
        break;
      default:
        const [fun, ...params] = eval_ast(lastAst, updatedEnv).value;
        if (fun instanceof MalFunction) {
          [lastAst, updatedEnv] = handleFunction(fun, params);
          break;
        }
        return fun.apply(null, params);
    }
  }

  return eval_ast(lastAst, updatedEnv);
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
