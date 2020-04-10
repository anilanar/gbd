declare module "@babel/helper-module-imports" {
  import { NodePath } from "@babel/core";
  import * as t from "@babel/types";

  export function addSideEffect(path: NodePath, moduleName: string): void;

  export function addNamed(
    path: NodePath,
    name: string,
    moduleName: string,
    opts?: { nameHint: string }
  ): t.Identifier;

  export function addDefault(
    path: NodePath,
    moduleName: string,
    opts: { nameHint: string }
  ): t.Identifier;

  export function addNamespace(
    path: NodePath,
    moduleName: string
  ): t.Identifier;
}
