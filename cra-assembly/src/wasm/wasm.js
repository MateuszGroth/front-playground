import loader from "@assemblyscript/loader";

const imports = {};

const getWasmInstance = (() => {
  let wasmInstance;
  return () => {
    if (wasmInstance) {
      return wasmInstance;
    }

    return (wasmInstance = loader
      .instantiate(fetch(new URL("webassembly.wasm", import.meta.url)), imports)
      .then(({ exports }) => exports));
  };
})();

export const add = (...arg) =>
  getWasmInstance().then((wasmInstance) => wasmInstance.add(...arg));

export default getWasmInstance;
