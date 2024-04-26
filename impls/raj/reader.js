const {
  MalList,
  MalSymbol,
  MalNil,
  MalVector,
  MalMap,
  MalQuote,
  MalBool,
  MalValue,
  MalString,
  MalKeyword,
} = require("./types");

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

const read_hashmap = reader => {
  const map = [];
  reader.next();

  while (reader.peek() !== "}") {
    if (reader.peek() === undefined) throw new Error("unbalanced");
    const key = read_form(reader);
    const value = read_form(reader);
    map.push([key, value]);
  }

  reader.next();

  return new MalMap(map);
};

const isString = (token, quote) => {
  if (token.startsWith(quote)) {
    if (token.endsWith(quote) && token.length > 1) {
      return true;
    }
    throw new Error("unbalanced");
  }

  return false;
};

const interpretString = token => {
  let interpretedString = "";

  for (let i = 0; i < token.length; i++) {
    let char = token[i];
    if (char === "\\") {
      i += 1;
      const nextChar = token[i];
      if (nextChar === '"' && i === token.length - 1)
        throw new Error("unbalanced");
      char = nextChar === "n" ? "\n" : nextChar;
    }

    interpretedString = interpretedString + char;
  }

  return interpretedString.slice(1, -1);
};

const read_atom = reader => {
  const token = reader.next();
  const numRegex = /^-?\d+$/;
  if (numRegex.test(token)) return new MalValue(parseInt(token));

  if (isString(token, "'") || isString(token, '"')) {
    const interpretedString = interpretString(token);
    return new MalString(interpretedString);
  }
  if (token.startsWith(":")) return new MalKeyword(token);

  switch (token) {
    case "true":
      return new MalBool(true);
    case "false":
      return new MalBool(false);
    case "nil":
      return new MalNil();
    default:
      return new MalSymbol(token);
  }
};

const read_quote = reader => {
  reader.next();
  return new MalQuote(read_form(reader));
};

const read_form = reader => {
  const token = reader.peek();
  switch (token) {
    case "(":
      return read_sequence(reader, ")", MalList);
    case "[":
      return read_sequence(reader, "]", MalVector);
    case "{":
      return read_hashmap(reader);
    case "'":
      return read_quote(reader);
    default:
      return read_atom(reader);
  }
};

const removeComments = str => {
  let processedStr = "";
  let insideQuote = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') insideQuote = !insideQuote;
    if (char === ";" && !insideQuote) break;
    processedStr += str[i];
  }

  return processedStr;
};

const read_str = str => {
  const processedStr = str.split("\n").map(removeComments).join("\n");
  const tokens = tokenize(processedStr);
  const reader = new Reader(tokens);
  const ast = read_form(reader);

  if (reader.peek()) throw new Error("unbalanced");
  return ast;
};

module.exports = { Reader, read_str };
