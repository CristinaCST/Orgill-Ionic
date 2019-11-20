const fs = require('fs');
const path = require('path');

module.exports = function (ctx) {
    if (!ctx.opts.options.release) {  // If the build is not release mode, abort.
        console.log('\x1b[2m%s\x1b[0m', '[VERSION-INVALIDATOR] INFO: Build is not in release mode, version string will not be invalidated this time.');
        return;
    }

    const version_path = 'src/util/version.ts'; //Target file
    const fpath = path.join(ctx.opts.projectRoot, version_path);  // Computed path of target file

    if (!fs.existsSync(fpath)) {  // If the file doesn't exist we print such error and abort
        console.error('\x1b[31m%s\x1b[0m', '[VERSION-INVALIDATOR] HOOK ERROR: You are trying to make a production build but the workflow has been disrupted somehow, the path expected was "' + version_path + '" but the parser only got to: ' + fpath);
        console.warn('\x1b[33m%s\x1b[0m', '[VERSION-INVALIDATOR] WARN: If you removed this specific trick from your build please remove the hook for this script from config.xml, otherwise check if you changed anything from the expected structre');
        return;
    }

    try {
        const version_file = fs.readFileSync(fpath).toString();   // Grab the contents of the file as string
        const parsed_file = version_file.replace('=', '_');   // Nuke it
        fs.writeFileSync(fpath, parsed_file);   // Write the nuke in file
    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', '[VERSION-INVALIDATOR] HOOK ERROR: ' + e);  // If we get any error print it and abort
        return;
    }

    console.log('\x1b[32m%s\x1b[0m', "[VERSION-INVALIDATOR] INFO: Version file invalidated after release build");  // If we got here everything was good
}

/* Leaving this here for upgrade potential. Currently the path is hardcoded, we can make a special file using this code.
function getPath(context, wantedPath){
    const vpath_tokens = wantedPath.split('/');
    let currentPath = context.opts.projectRoot;
    let files = fs.readdirSync(currentPath);

    for (let depth = 0; depth < vpath_tokens.length; depth++) {
        let stat = fs.lstatSync(currentPath);
        if (stat.isDirectory()) {
            files = fs.readdirSync(currentPath);
        }else{
            return currentPath;
        }

        for (let i = 0; i < files.length; i++) {
            let filepath = path.join(currentPath, files[i]);
            if (filepath === path.join(currentPath, vpath_tokens[depth])) {
                currentPath = filepath;
                break;
            }
        }
    }

    if(fs.existsSync(currentPath)){
        return currentPath;
    }
    return '';
}*/