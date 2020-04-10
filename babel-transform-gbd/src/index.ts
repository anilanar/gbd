import generate from "@babel/generator";
import type * as Babel from "@babel/core";
import * as A from "fp-ts/lib/Array";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as IO from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import { identity } from "fp-ts/lib/function";

type References = { default: Babel.NodePath[] } & Record<
  string,
  Babel.NodePath[]
>;

export const transform = (
  references: References,
  { types: t }: typeof Babel
): IO.IOEither<Error, void> =>
  pipe(
    R.lookup("gbd", references),
    O.fold(() => [], identity),
    A.map((call) =>
      pipe(
        call.parentPath,
        IO.fromPredicate(
          (
            callExprPath: Babel.NodePath<any>
          ): callExprPath is Babel.NodePath<Babel.types.CallExpression> =>
            t.isCallExpression(callExprPath.node),
          () =>
            call.buildCodeFrameError("gdb must be used as a call expression.")
        )
      )
    ),
    A.map(
      IO.chain((callExprPath) =>
        pipe(
          NEA.fromArray(callExprPath.node.arguments),
          O.filter(
            (args): args is [Babel.types.Expression] =>
              args.length === 1 && t.isExpression(NEA.head(args))
          ),
          O.map(
            ([expression]) =>
              [callExprPath, expression] as [
                Babel.NodePath<Babel.types.CallExpression>,
                Babel.types.Expression
              ]
          ),
          IO.fromOption(() =>
            callExprPath.buildCodeFrameError(
              "gdb must be called with exactly one argument and that argument must be an expression."
            )
          )
        )
      )
    ),
    A.array.sequence(IO.ioEither),
    IO.map(
      A.map(([callExprPath, expr]) =>
        IO.rightIO<Error, void>(() => {
          callExprPath.replaceWith(
            t.callExpression(callExprPath.node.callee, [
              expr,
              t.stringLiteral(generate(expr).code),
            ])
          );
        })
      )
    ),
    IO.chain(A.array.sequence(IO.ioEither)),
    IO.map(() => undefined)
  );
