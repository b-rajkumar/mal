const { MalList, MalValue, MalBool, MalString, MalNil } = require("./types");
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
  not,
  "pr-str": pr_str_all,
  prn,
  str,
  println,
};

module.exports = { ns };
