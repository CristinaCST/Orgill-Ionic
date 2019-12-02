let chalk = require("chalk");
let fs = require('fs');
let path = require('path');
let useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

let env = process.env.IONIC_ENV;

useDefaultConfig.prod.resolve.alias = {
  "@app/env": path.resolve(environmentPath('prod'))
};

useDefaultConfig.dev.resolve.alias = {
  "@app/env": path.resolve(environmentPath('dev'))
};

if (env === 'prod' || env === 'dev') {
  // Default to dev config
  useDefaultConfig[env] = useDefaultConfig.dev;
  useDefaultConfig[env].resolve.alias = {
    "@app/env": path.resolve(environmentPath(env))
  };
}

function environmentPath(env) {
  let filePath = './src/environments/environment' + (env === 'prod' ? '' : '.' + env) + '.ts';
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('\n' + filePath + ' does not exist!'));
  } else {
    return filePath;
  }
}

module.exports = function () {
  return useDefaultConfig;
};

// var chalk = require("chalk");
// var fs = require('fs');
// var path = require('path');
// var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

// //var env = process.env.IONIC_ENV;
// useDefaultConfig.prod.resolve.alias = {
//   "@app/env": path.resolve(environmentPath())
// };

// useDefaultConfig.dev.resolve.alias = {
//   "@app/env": path.resolve(environmentPath())
// };

// function environmentPath(env) {
//   //var filePath = './src/env/env' + (env === 'prod' ? '.' + env : '') + '.ts';

//   var filePath = './src/environments/environment.dev.ts';

//   if (!fs.existsSync(filePath)) {
//     console.log(chalk.red('\n' + filePath + ' does not exist!'));
//   } else {
//     return filePath;
//   }
// }

// function consoleOut(env) {
//   console.log("=============== ENVIRONMENT ===============");
//   console.log("                                           ");
//   console.log("                 "+env+"                   ");
//   console.log("                                           ");
//   console.log("===========================================");
// }

// module.exports = function () {

//   var env = process.env.ENV || 'dev';

//   consoleOut(env);
//   return useDefaultConfig;
// };
