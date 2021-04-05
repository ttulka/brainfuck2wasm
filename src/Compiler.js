import binaryen from 'binaryen';

export default class Compiler {

  compile(ast) {
    this.loopIdx = 0;
    this.module = new binaryen.Module();

    this.initModule();

    const body = this.compileBranch(ast);
    this.addMainFunction(body);

    //console.debug(this.module.emitText());

    if (!this.module.validate()) throw new SyntaxError('Module invalid.');

    this.module.optimize();

    return this.module.emitBinary();
  }

  initModule() {
    this.module.addFunctionImport('input', 'main', 'input', binaryen.none, binaryen.i32);
    this.module.addFunctionImport('output', 'main', 'output', binaryen.i32, binaryen.none);
    this.module.addFunctionImport('debug', 'main', 'debug', binaryen.createType([binaryen.i32, binaryen.i32]), binaryen.none);
    
    this.module.addGlobal('p', binaryen.i32, true, this.module.i32.const(0));  // pointer  
    
    this.module.setMemory(1, 1);
  }

  addMainFunction(body) {
    const block = this.module.block('exec', body);
    this.module.addFunction('main', binaryen.none, binaryen.none, [], block);
    this.module.addFunctionExport('main', 'main');
  }

  compileBranch(branch) {
    const body = [];
    branch.children.forEach(cmd => {
      let c;
      switch (cmd.kind) {
        case '+':
          c = this.increment(cmd.amount);
          body.push(c);
          break;
        case '-':
          c = this.decrement(cmd.amount);
          body.push(c);
          break;
        case '>':
          c = this.moveRight(cmd.amount);
          body.push(c);
          break;
        case '<':
          c = this.moveLeft(cmd.amount);
          body.push(c);
          break;
        case '.':
          c = this.output();
          body.push(c);
          break;
        case ',':
          c = this.input();
          body.push(c);
          break;
        case 'loop':
          c = this.loop(cmd, this.loopIdx++);
          body.push(c);
          break;
        case '#':
          c = this.debug();
          body.push(c);
          break;
      }
    });
    return body;
  }

  increment(amount) {
    const p = this.module.global.get('p', binaryen.i32);
    const val = this.module.i32.load8_u(0, 1, p);
    const add = this.module.i32.add(val, this.module.i32.const(amount));
    const sto = this.module.i32.store8(0, 1, p, add);
    return sto;
  }

  decrement(amount) {
    const p = this.module.global.get('p', binaryen.i32);
    const val = this.module.i32.load8_u(0, 1, p);
    const sub = this.module.i32.sub(val, this.module.i32.const(amount));
    const sto = this.module.i32.store8(0, 1, p, sub);
    return sto;
  }

  moveRight(amount) {
    const p = this.module.global.get('p', binaryen.i32);
    const add = this.module.i32.add(p, this.module.i32.const(amount));
    const set = this.module.global.set('p', add);
    return set;
  }

  moveLeft(amount) {
    const p = this.module.global.get('p', binaryen.i32);
    const sub = this.module.i32.sub(p, this.module.i32.const(amount));
    const set = this.module.global.set('p', sub);
    return set;
  }

  output() {
    const p = this.module.global.get('p', binaryen.i32);
    const val = this.module.i32.load8_u(0, 1, p);
    const cal = this.module.call('output', [val], binaryen.none);
    return cal;
  }

  input() {
    const p = this.module.global.get('p', binaryen.i32);
    const cal = this.module.call('input', [], binaryen.i32);
    const sto = this.module.i32.store8(0, null, p, cal);
    return sto;
  }

  loop(branch, idx) {
    const commands = this.compileBranch(branch);

    const label = 'l' + idx;
    
    const p = this.module.global.get('p', binaryen.i32);
    const val = this.module.i32.load8_u(0, 1, p);
    const br = this.module.br_if(label, val);

    const block = this.module.block(null, [...commands, br]);
    const loop = this.module.loop(label, block);
    return loop;
  }

  debug() {
    const p = this.module.global.get('p', binaryen.i32);
    const val = this.module.i32.load8_u(0, 1, p);
    const cal = this.module.call('debug', [p, val], binaryen.none);
    return cal;
  }
}
