const fs = require('fs');

/**
 * This hook overwrites environment.ts with the right one.
 */

module.exports = function (ctx) {
  const env = ctx.opts.options.production ? 'prod' : 'dev';

  console.log(JSON.stringify(ctx.opts.options));
  const filePath = `src/environments/environment.${env}.ts`;

  const data = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync('src/environments/environment.ts', data, 'utf-8');

  console.log("============ PREPARE ENV FILE =============");
  console.log("                                           ");
  console.log("                 " + env + "               ");
  console.log("              " + filePath + "             ");
  console.log("                                           ");
  console.log("===========================================");

}