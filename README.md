# Brainfuck to WebAssembly Compiler

[Binaryen](https://github.com/WebAssembly/binaryen) based compiler from brainfuck to WebAssembly (Wasm).

## Usage

```sh
# install:
$ npm install
$ npm link

# alternatively:
$ npm install brainfuck2wasm -g

# write some brainfuck code:
$ echo ">,[>,]<[.<]" > reverse.b

# compile it:
$ brainfuck2wasm reverse.b

# run wasm:
$ node index.js reverse.wasm ABCD
DCBA
```

## License

[MIT](https://github.com/ttulka/brainfuck2wasm/blob/main/LICENSE)

