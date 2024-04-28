const {
  MalList,
  MalValue,
  MalBool,
  MalString,
  MalNil,
  MalAtom,
} = require("./types");
const { pr_str } = require("./printer");

const isList = malType => malType instanceof MalList;
const not = val => {
  const falsyValues = [null, false];
  const notOfVal = falsyValues.some(a => val.value === a);

  return new MalBool(notOfVal);
};

const pr_str_all = (...malTypes) => {
  return new MalString(malTypes.map(e => pr_str(e, true)).join(" "));
};

const str = (...malTypes) => {
  return new MalString(malTypes.map(e => pr_str(e, false)).join(""));
};

const println = (...malTypes) => {
  console.log(malTypes.map(e => pr_str(e, false)).join(" "));
  return new MalNil();
};

const prn = (...malTypes) => {
  console.log(malTypes.map(e => pr_str(e, true)).join(" "));
  return new MalNil();
};

const handleSlurp = (ast, env) => {
  const [_, path] = ast.value;
  const evaluatedPath = eval_ast(path, env);
  const content = fs.readFileSync(evaluatedPath.value, "utf-8");
  return new MalString(content);
};

const createFunc = (ast, env) => {
  const [_, params, ...more] = ast.value;
  return new MalFunction([env, params, ...more]);
};

const handleReadString = (ast, env) => {
  const [_, a] = ast.value;
  const str = a instanceof MalString ? a.value : EVAL(a, env).value;
  return read_str(str);
};

const createAtom = ast => {
  const [_, value] = ast.value;

  return new MalAtom(value);
};

const ns = {
  list: (...args) => new MalList(args),
  "empty?": malList => new MalBool(malList.value.length === 0),
  "list?": isList,
  count: malList =>
    new MalValue(Array.isArray(malList.value) ? malList.value.length : 0),
  "+": (a, b) => new MalValue(a.value + b.value),
  "-": (a, b) => new MalValue(a.value - b.value),
  "*": (a, b) => new MalValue(a.value * b.value),
  "/": (a, b) => new MalValue(a.value / b.value),
  "=": (a, b) => new MalBool(a.equals(b)),
  ">": (a, b) => new MalBool(a.value > b.value),
  "<": (a, b) => new MalBool(a.value < b.value),
  ">=": (a, b) => new MalBool(a.value >= b.value),
  "<=": (a, b) => new MalBool(a.value <= b.value),
  "atom?": a => a instanceof MalAtom,
  deref: a => a.value,
  "reset!": (a, value) => (a.value = value),
  not,
  "pr-str": pr_str_all,
  prn,
  str,
  println,
};

module.exports = { ns };
