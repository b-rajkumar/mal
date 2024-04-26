const MalType = require("./mal_type");
const { pr_str } = require("./printer");

const isSequence = a => a instanceof MalList || a instanceof MalVector;

const compareArrays = (a, b) => {
  if (a.length != b.length) return false;
  return a.every((e, i) => {
    if (e instanceof MalType) return e.equals(b[i]);
    if (Array.isArray(e) && Array.isArray(b[i])) return compareArrays(e, b[i]);

    return e === b[i];
  });
};

class MalList extends MalType {
  constructor(list) {
    super();
    this.value = list;
  }

  pr_str(printReadably) {
    return "(" + this.value.map(e => pr_str(e, printReadably)).join(" ") + ")";
  }

  isEmpty() {
    return this.value.length === 0;
  }

  equals(b) {
    if (!isSequence(b)) return false;
    return compareArrays(this.value, b.value);
  }
}

class MalVector extends MalType {
  constructor(list) {
    super();
    this.value = list;
  }

  pr_str(printReadably) {
    return "[" + this.value.map(e => pr_str(e, printReadably)).join(" ") + "]";
  }

  equals(b) {
    if (!isSequence(b)) return false;
    return compareArrays(this.value, b.value);
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

  equals(b) {
    if (!(b instanceof MalSymbol)) return false;
    return this.value === b.value;
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

  equals(b) {
    return b instanceof MalNil;
  }
}

class MalMap extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str(printReadably) {
    return (
      "{" +
      this.value
        .flat()
        .map(e => pr_str(e, printReadably))
        .join(" ") +
      "}"
    );
  }

  equals(b) {
    if (!(b instanceof MalMap)) return false;
    if (this.value.length != b.value.length) return false;
    return this.value.every((e, i) => {
      return compareArrays(e, b.value[i]);
    });
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

  equals(b) {
    if (!(b instanceof MalQuote)) return false;
    if (this.value instanceof MalType) return this.value.equals(b.value);
  }
}

class MalFunction extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return "#<function>";
  }
}

class MalBool extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  equals(b) {
    if (!(b instanceof MalBool)) return false;
    return this.value === b.value;
  }
}

class MalString extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str(printReadably) {
    if (printReadably) {
      return (
        '"' +
        this.value
          .replaceAll("\\", "\\\\")
          .replaceAll('"', '\\"')
          .replaceAll("\n", "\\n") +
        '"'
      );
    }

    return this.value;
  }

  equals(b) {
    if (!(b instanceof MalString)) return false;
    return this.value === b.value;
  }
}

class MalValue extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  equals(b) {
    if (!(b instanceof MalValue)) return false;
    return this.value === b.value;
  }
}

class MalKeyword extends MalType {
  constructor(value) {
    super();
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  equals(b) {
    if (!(b instanceof MalKeyword)) return false;
    return this.value === b.value;
  }
}

module.exports = {
  MalList,
  MalSymbol,
  MalNil,
  MalVector,
  MalMap,
  MalQuote,
  MalFunction,
  MalBool,
  MalString,
  MalValue,
  MalKeyword,
};
