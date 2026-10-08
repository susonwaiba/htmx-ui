// Every migration, oldest first. A release with breaking changes adds migrations/<version>.ts
// (the changes from the previous release to <version>) and lists it here.
import type { Migration } from "../transforms";
import v0_2_0 from "./0.2.0";
import v0_3_0 from "./0.3.0";

export const MIGRATIONS: Migration[] = [v0_2_0, v0_3_0];
