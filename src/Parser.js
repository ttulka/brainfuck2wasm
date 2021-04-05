export default class Parser {

  constructor() {
    this.cmdMap = new Map();
    this.cmdMap.set(43, '+');
    this.cmdMap.set(45, '-');
    this.cmdMap.set(62, '>');
    this.cmdMap.set(60, '<');
    this.cmdMap.set(46, '.');
    this.cmdMap.set(44, ',');
    this.cmdMap.set(91, '[');
    this.cmdMap.set(93, ']');
    this.cmdMap.set(35, '#');
  }

  parse(input) {
    this.input = input;
    this.index = 0;
    this.ast = [{ kind: 'root', children: [] }];

    while (!this.eof()) {
      this.parseCommand();
    }

    const root = this.ast.pop();
    if (root.kind !== 'root') throw new SyntaxError('unmatched [');

    return root;
  }

  parseCommand() {
    let code;
    if (!this.isWhitespace(code = this.input[this.index++].charCodeAt())) {
      const kind = this.commandFor(code);
      const cmd = { kind };

      const branch = this.ast[this.ast.length - 1];

      if (kind === '[') {
        cmd.kind = 'loop';
        cmd.children = [];
        branch.children.push(cmd);

        this.ast.push(cmd);
      
      } else if (kind === ']') {
        if (this.ast.pop().kind !== 'loop') throw new SyntaxError('unmatched ]');

      } else {
        let eliminated = false;
        if (branch.children.length) {
          const last = branch.children[branch.children.length - 1];
          if (last.kind === cmd.kind) {
            last.amount++;
            eliminated = true;
          }
        }
        if (!eliminated) {
          cmd.amount = 1;
          branch.children.push(cmd);
        }
      }
    }
  }

  commandFor(code) {
    return this.cmdMap.get(code);
  }

  isWhitespace(code) {
    return !this.cmdMap.has(code);
  }

  eof() {
    return this.index >= this.input.length;
  }
}
