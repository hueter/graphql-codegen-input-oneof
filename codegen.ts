import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  generates: {
    './generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
    './generated/types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: true,
      },
    },
  },
};

export default config;
