/* eslint-disable no-console */
// import("./webassembly.wasm").then(({ add }) => {
//   console.log(a);
//   //   console.log(AsyncFactorial); // [native code]
//   //   console.log(AsyncFactorial(1));
//   //   console.log(AsyncFactorial(2));
//   //   console.log(AsyncFactorial(3));
// });

export const add = async (...arg) => {
  const instance = await import("./webassembly.wasm");

  return instance.add(...arg);
};
