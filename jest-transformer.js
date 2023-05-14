const { createTransformer } = require('babel-jest');

const babelOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript', // Add this line
  ],
};

module.exports = createTransformer(babelOptions);
