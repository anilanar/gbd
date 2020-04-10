import { createMacro, MacroError } from "babel-plugin-macros";
import { transform } from "babel-transform-gbd";
import * as E from "fp-ts/lib/Either";

export default createMacro(({ references, babel }) => {
  const eff = transform(references, babel);
  const result = eff();
  if (E.isLeft(result)) {
    throw new MacroError(result.left.message);
  }
});
