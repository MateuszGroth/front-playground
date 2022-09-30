import loader from "@assemblyscript/loader";

interface API {
  add(a: number, b: number): number;
  [index: string]: unknown;
}

const imports: any = {};
export default loader
  .instantiate<API>(fetch("./as-api.wasm"), imports)
  .then(({ exports }) => exports);
