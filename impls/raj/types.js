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

  isEmpty() {
    return this.value.length === 0;
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

class MalMap extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return "{" + this.value.flat().map(pr_str).join(" ") + "}";
  }
}

class MalQuote extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return "(quote " + pr_str(this.value) + ")";
  }
}

module.exports = { MalList, MalSymbol, MalNil, MalVector, MalMap, MalQuote };
