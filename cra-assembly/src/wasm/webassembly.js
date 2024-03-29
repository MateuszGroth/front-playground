async function instantiate(module, imports = {}) {
  const { exports } = await WebAssembly.instantiate(module, imports);
  return exports;
}
export const { memory, add } = await (async (url) =>
  instantiate(
    await (async () => {
      try {
        return await globalThis.WebAssembly.compileStreaming(
          globalThis.fetch(url)
        );
      } catch {
        return globalThis.WebAssembly.compile(
          await (await import("node:fs/promises")).readFile(url)
        );
      }
    })(),
    {}
  ))(new URL("webassembly.wasm", import.meta.url));

export const add = async (...arg) => {
  const instance = await instantiate(
    await fetch(new URL("webassembly.wasm", import.meta.url)).then((response) =>
      response.arrayBuffer()
    ),
    { env: "test" }
  );
  return instance.addTest(...arg);
};
