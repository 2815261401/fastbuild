/**
 * @type {import('cz-customizable').Options|((config) => import('cz-customizable').Options)|(config) => Promise<import('cz-customizable').Options>}
 **/
module.exports = (config) => {
  const fs = require('fs');
  const path = require('path');
  let scopes = [];
  if (fs.existsSync(path.resolve(__dirname, 'src'))) {
    scopes = scopes.concat(
      fs
        .readdirSync(path.resolve(__dirname, 'src'), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
    );
  }
  return {
    ...config,
    scopes,
  };
};
