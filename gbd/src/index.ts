import format from "pretty-format";

/**
 * Pretty prints a value and returns it unchanged.
 * @param val Value to debug.
 * @param expr Passed by the babel plugin.
 * @returns Value that was passed, unchanged.
 */
export function gbd<T>(val: T, expr?: string): T {
  if (expr === undefined) {
    console.error(
      "gdb :: No expression is found. Did you forget to use the babel plugin or the babel macro?"
    );
    return val;
  }
  console.debug(`> ${expr}\n= ${format(val)}`);
  return val;
}
