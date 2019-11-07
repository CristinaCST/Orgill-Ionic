var fs = require('fs');

// if (process.argv.length < 3){
//   console.log('////////')
//   console.error("Please specify dev or prod environment in package.json by adding a third parameter to the ionic:serve:build")
//   console.log('////////')
//   return;
// }

let env = process.argv[2] || prod;
let filePath = `src/environments/environment.${env}.ts`;

var data = fs.readFileSync(filePath, 'utf-8');
fs.writeFileSync('src/environments/environment.ts', data, 'utf-8');

console.log("============ PREPARE ENV FILE =============");
console.log("                                           ");
console.log("                 "+env+"                   ");
console.log("              "+filePath+"                 ");
console.log("                                           ");
console.log("===========================================");
