const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");

const rl = readline.createInterface({ input, output });
const READ = str => str;
const EVAL = str => str;
const PRINT = str => str;
const rep = expStr => PRINT(EVAL(READ(expStr)));

const repl = () =>
  rl.question("user> ", input => {
    console.log(rep(input));
    repl();
  });

repl();
