import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: [
    // Simple expression
    `
      import { gbd } from 'gbd.macro'
      gbd(1 + 1);
    `,
    // Complex expression
    `
      import { gbd } from 'gbd.macro'
      gbd(new foo(1 + 1)[1].bar());
    `,
    // Multiline expression
    `
      import { gbd } from 'gbd.macro'
      gbd({
        multi: 'foo',
        line: 'bar',
        obj: 'quu',
      });
    `,
    // Multiline expression in an indented closure
    `
      import { gbd } from 'gbd.macro'
      function test() {
        gbd({
          multi: 'foo',
          line: 'bar',
          obj: 'quu',
        });
      }
    `,
    // Multiple gbds in a single program
    `
    import { gbd } from 'gbd.macro'
    function test() {
      gbd(1 + 2);
    }
    gbd(1 + 2);
  `,
  ],
});
