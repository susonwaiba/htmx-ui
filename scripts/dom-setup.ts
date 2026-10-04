// Registers a DOM in the test runner so feature/component modules can be
// tested directly. No-ops if something already provided one.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// happy-dom replaces the fetch primitives with its own; server code must keep the
// runtime's, or Bun.serve rejects every response it is handed ("Expected a Response
// object"). Kept here so tests of the dev server, the engine and the site all use them.
const native = { Request, Response, Headers, FormData, Blob, File };

if (typeof document === "undefined") GlobalRegistrator.register();

Object.assign(globalThis, native);