const MalType = require("./mal_type");
const { pr_str } = require("./printer");

class MalList extends MalType {
  constructor(list) {
    super();
    this.value = list;
  }

  pr_str() {
    return "(" + this.value.map(pr_str).join(" ") + ")";
  }
}

class MalVector extends MalType {
  constructor(list) {
    super();
    this.value = list;
  }

  pr_str() {
    return "[" + this.value.map(pr_str).join(" ") + "]";
  }
}

class MalSymbol extends MalType {
  constructor(symbol) {
    super();
    this.value = symbol;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalNil extends MalType {
  constructor() {
    super();
    this.value = null;
  }

  pr_str() {
    return "nil";
  }
}

module.exports = { MalList, MalSymbol, MalNil, MalVector };
