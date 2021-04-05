import fs from 'fs';
import { exit } from 'process';

import Parser from './Parser.js';
import Compiler from './Compiler.js';

export function main(args) {
  if (args.length < 1) {
    console.error('Input file must be provided in arguments.');
    exit(1);
  }

  const sourceFile = args[0];
  const input = fs.readFileSync(sourceFile, 'utf-8');
  const moduleName = sourceFile.slice(0, sourceFile.lastIndexOf('.'));
  
  const binary = compile(input);

  fs.writeFileSync(`${moduleName}.wasm`, binary);
}

function compile(input, moduleName) {
  const parser = new Parser();
  const ast = parser.parse(input);

  const compiler = new Compiler();
  return compiler.compile(ast, moduleName);
}
