const { MalList, MalSymbol, MalNil, MalVector } = require("./types");

class Reader {
  #tokens;
  #position;

  constructor(tokens) {
    this.#tokens = tokens;
    this.#position = 0;
  }

  peek() {
    return this.#tokens[this.#position];
  }

  next() {
    const token = this.peek();
    this.#position += 1;
    return token;
  }
}

const tokenize = str => {
  const regex =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  const tokens = [...str.matchAll(regex)].map(e => e[1]).filter(e => e !== "");

  return tokens;
};

const read_sequence = (reader, closing_token, type) => {
  const list = [];
  reader.next();
  while (reader.peek() !== closing_token) {
    if (reader.peek() === undefined) throw new Error("unbalanced");
    list.push(read_form(reader));
  }
  reader.next();

  return new type(list);
};

const read_atom = reader => {
  const token = reader.next();
  const numRegex = /^\d+$/;
  if (numRegex.test(token)) return parseInt(token);

  switch (token) {
    case "true":
      return true;
    case "false":
      return false;
    case "nil":
      return new MalNil();
    default:
      return new MalSymbol(token);
  }
};

const read_form = reader => {
  const token = reader.peek();
  switch (token) {
    case "(":
      return read_sequence(reader, ")", MalList);
    case "[":
      return read_sequence(reader, "]", MalVector);
    default:
      return read_atom(reader);
  }
};
``;
const read_str = str => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  const ast = read_form(reader);
  if (reader.peek()) throw new Error("unbalanced");
  return ast;
};

module.exports = { Reader, read_str };
