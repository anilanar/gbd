import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: [
    `
      import { gbd } from 'gbd.macro'
      gbd(1 + 1);
    `,
    `
      import { gbd } from 'gbd.macro'
      gbd(new foo(1 + 1)[1].bar());
    `,
    `
      import { gbd } from 'gbd.macro'
      gbd({
        multi: 'foo',
        line: 'bar',
        obj: 'quu',
      });
    `,
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
  ],
});
