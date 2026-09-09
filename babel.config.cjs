const t = require('@babel/types')

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
  ],
  plugins: [
    function transformImportMeta() {
      return {
        name: 'transform-import-meta-env',
        visitor: {
          MetaProperty(path) {
            const { node } = path
            if (node.meta.name === 'import' && node.property.name === 'meta') {
              path.replaceWith(t.identifier('IMPORT_META'))
            }
          },
        },
      }
    },
  ],
}