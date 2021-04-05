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
    this.source = input;
    this.index = 0;
    this.ast = [{ kind: 'root', children: [] }];

    while (!this.eof()) {
      this.parseCommand();
    }

    const root = this.ast.pop();

    // are we still in an unclosed branch?
    if (root.kind !== 'root') throw new SyntaxError('unmatched [');

    return root;
  }

  parseCommand() {
    const code = this.source[this.index++].charCodeAt();
    if (!this.isWhitespace(code)) {
      const kind = this.commandFor(code);
      const cmd = { kind };

      // current branch
      const branch = this.ast[this.ast.length - 1];

      if (kind === '[') {
        // loop begin
        cmd.kind = 'loop';
        cmd.children = [];
        // push to the current branch
        branch.children.push(cmd);

        // push a new branch for loop
        this.ast.push(cmd);
      
      } else if (kind === ']') {
        // are we currently in a loop branch?
        if (this.ast.pop().kind !== 'loop') throw new SyntaxError('unmatched ]');

      } else {
        // eliminate commands by grouping them
        let eliminated = false;
        if (branch.children.length 
            && kind !== '.' && kind !== ',') {  // output and input cannot be grouped
          // following the same kind of command?
          const last = branch.children[branch.children.length - 1];
          if (last.kind === kind) {
            last.amount++;  // increase the group amount
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
    return this.index >= this.source.length;
  }
}
