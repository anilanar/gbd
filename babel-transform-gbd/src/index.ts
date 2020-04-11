import generate from "@babel/generator";
import type * as Babel from "@babel/core";
import * as A from "fp-ts/lib/Array";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import * as IO from "fp-ts/lib/IO";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import { unsafeCoerce, flow } from "fp-ts/lib/function";
import { addNamed } from "@babel/helper-module-imports";
import { Do } from "fp-ts-contrib/lib/Do";

type References = { default: Babel.NodePath[] } & Record<
  string,
  Babel.NodePath[]
>;
type CallExprPath = Babel.NodePath<Babel.types.CallExpression>;
type Expr = Babel.types.Expression;
type Iden = Babel.types.Identifier;

export const transform = (
  references: References,
  { types: t }: typeof Babel
): IOE.IOEither<Error, void> =>
  pipe(
    // Get call paths as a NonEmptyArray
    IOE.fromEither(getCallPaths(references, t)),
    IOE.chain(
      flow(
        // Do side effects on NonEmptyArray of calls
        O.map(processCalls(t)),
        O.option.sequence(IOE.ioEither),
        IOE.map(() => undefined)
      )
    )
  );

const processCalls = (t: typeof Babel.types) => (
  calls: NEA.NonEmptyArray<CallExprPath>
): IOE.IOEither<Error, void> =>
  Do(IOE.ioEither)
    // Add a single gdb import, keep identifier node
    .bind(
      "iden",
      pipe(addGbdImport(calls), IO.map(E.right)) as IOE.IOEither<Error, Iden>
    )
    // Convert call paths to (call path, arg expression) tuples
    // This operation is failable
    .bind(
      "tuples",
      pipe(
        calls,
        NEA.map(combineWithExpr(t)),
        NEA.nonEmptyArray.sequence(E.either),
        IOE.fromEither
      )
    )
    // Replace call paths with gdb(arg expression) calls
    .doL(({ tuples, iden }) =>
      pipe(replaceWithGbd(t)(iden, tuples), IO.map(E.right))
    )
    // Nothing valuable to return from this operation
    .return(() => undefined);

const getCallPaths = (
  references: References,
  t: typeof Babel.types
): E.Either<
  Error,
  O.Option<NEA.NonEmptyArray<Babel.NodePath<Babel.types.CallExpression>>>
> =>
  pipe(
    // See if there's a gdb import in refs
    R.lookup("gbd", references),
    // Convert to non empty array, because if empty there's nothing to do.
    O.chain(NEA.fromArray),
    O.map(
      flow(
        // Validate path type and create an informative error
        NEA.map((call) =>
          pipe(
            call.parentPath,
            E.fromPredicate(
              (
                callExprPath: Babel.NodePath<any>
              ): callExprPath is Babel.NodePath<Babel.types.CallExpression> =>
                t.isCallExpression(callExprPath.node),
              () =>
                call.buildCodeFrameError(
                  "gdb must be used as a call expression."
                )
            )
          )
        ),
        NEA.nonEmptyArray.sequence(E.either)
      )
    ),
    O.option.sequence(E.either)
  );

const getExpression = (
  callExprPath: CallExprPath,
  t: typeof Babel.types
): E.Either<Error, Expr> =>
  pipe(
    NEA.fromArray(callExprPath.node.arguments),
    O.filter(
      (args): args is [Babel.types.Expression] =>
        args.length === 1 && t.isExpression(NEA.head(args))
    ),
    O.map(([expression]) => expression),
    E.fromOption(() =>
      callExprPath.buildCodeFrameError(
        "gdb must be called with exactly one argument and that argument must be an expression."
      )
    )
  );

const combineWithExpr = (t: typeof Babel.types) => (
  call: CallExprPath
): E.Either<Error, [CallExprPath, Expr]> =>
  pipe(
    getExpression(call, t),
    E.map((expr) => [call, expr] as [CallExprPath, Expr])
  );

const replaceWithGbd = (t: typeof Babel.types) => (
  iden: Iden,
  tuples: NEA.NonEmptyArray<[CallExprPath, Expr]>
): IO.IO<void> =>
  pipe(
    tuples,
    NEA.map(([callExprPath, expr]) => () => {
      callExprPath.replaceWith(
        t.callExpression(t.cloneDeep(iden), [
          expr,
          t.stringLiteral(generate(expr).code),
        ])
      );
    }),
    A.array.sequence(IO.io),
    IO.map((): void => undefined)
  );

const addGbdImport = (paths: NEA.NonEmptyArray<CallExprPath>): IO.IO<Iden> =>
  pipe(paths, NEA.head, (path) => () =>
    addNamed(unsafeCoerce(path), "gbd", "gbd")
  );
