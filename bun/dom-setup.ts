// Registers a DOM in the test runner so feature/component modules can be
// tested directly. No-ops if something already provided one.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof document === "undefined") GlobalRegistrator.register();
