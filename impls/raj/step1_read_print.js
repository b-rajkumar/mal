const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");

const rl = readline.createInterface({ input, output });
const READ = str => read_str(str);
const EVAL = str => str;
const PRINT = ast => console.log(pr_str(ast, true));
const rep = expStr => PRINT(EVAL(READ(expStr)));

const repl = () =>
  rl.question("user> ", input => {
    try {
      rep(input);
    } catch (e) {
      console.log(e);
    }
    repl();
  });

repl();
