import fs from 'fs';

const args = process.argv.slice(2);
const wasm = args[0];
const input = args[1];
const inputGen = readChar(input);

function* readChar(str = '') {    
  for (let s of str.split('')) yield s.charCodeAt();
}

WebAssembly
  .instantiate(fs.readFileSync(wasm), {
    main: {
      input: () => inputGen.next().value,
      output: c => process.stdout.write(String.fromCharCode(c)),
      debug: (p, v) => console.log('DEBUG', p, v)  
    }
  })
  .then(({ instance }) => instance.exports.main())
  .catch(err => console.error('Error while loading Wasm file:', err));
