# GraphQL Codegen @oneOf Directive Demo

This is a minimal full stack application demonstrating the current lack of support for the `@oneOf` directive in GraphQL introspection and code generation workflows.

## Overview

The GraphQL `@oneOf` directive ensures that exactly one field in an input type is provided. This demo uses **GraphQL Ruby** (which has full `@oneOf` support) to show how the directive information is not preserved during introspection.

### Backend Schema (GraphQL Ruby)

The GraphQL Ruby schema properly defines the `@oneOf` directive:

```ruby
# app/graphql/types/search_filter_input_type.rb
class SearchFilterInputType < Types::BaseInputObject
  description "Example input type using @oneOf directive"
  one_of  # ← Enables @oneOf directive

  argument :by_name, String, required: false
  argument :by_id, ID, required: false
  argument :by_category, String, required: false
end
```

When you run `rails runner "puts ServerRailsSchema.to_definition"`, the schema correctly shows:

```graphql
directive @oneOf on INPUT_OBJECT

input SearchFilterInput @oneOf {  # ✅ @oneOf present in Ruby schema
  byCategory: String
  byId: ID
  byName: String
}
```

### Observation #1: Introspection Doesn't Include @oneOf

When GraphQL Codegen queries the backend via introspection (see `generated/schema.graphql:16`), the `@oneOf` directive is not included:

```graphql
input SearchFilterInput {  # @oneOf directive not preserved during introspection
  byCategory: String
  byId: ID
  byName: String
}
```

This is because the standard GraphQL introspection query doesn't currently return applied directives on input types.

### Observation #2: TypeScript Types Don't Enforce @oneOf

The `typescript` plugin generates a TypeScript type where all fields are optional (see `generated/types.ts:32-36`):

```typescript
export type SearchFilterInput = {
  byCategory?: InputMaybe<Scalars['String']['input']>;
  byId?: InputMaybe<Scalars['ID']['input']>;
  byName?: InputMaybe<Scalars['String']['input']>;
};
```

### Potential Enhancement

One way to represent the `@oneOf` constraint in TypeScript would be to generate a union type:

```typescript
export type SearchFilter =
  | { byCategory: Scalars['String']['input']; byId?: never; byName?: never; }
  | { byId: Scalars['ID']['input']; byCategory?: never; byName?: never; }
  | { byName: Scalars['String']['input']; byCategory?: never; byId?: never; };
```

## Project Structure

```
graphql-oneof-issue/
├── server/                             # Rails API backend
│   ├── app/graphql/
│   │   ├── types/
│   │   │   ├── search_filter_input_type.rb  # Input with @oneOf
│   │   │   ├── search_result_type.rb        # Result type
│   │   │   └── query_type.rb                # Query with search field
│   │   └── server_rails_schema.rb           # GraphQL schema
│   └── config/
│       └── routes.rb                         # POST /graphql endpoint
├── client/                             # Vite React frontend
│   └── src/
│       └── App.tsx                     # Apollo Client integration
├── generated/
│   ├── schema.graphql                  # Generated (missing @oneOf)
│   └── types.ts                        # Generated (no union types)
├── codegen.ts                          # GraphQL Codegen configuration
└── package.json
```

## Running the Demo

### Install Dependencies

```bash
# Root dependencies (codegen)
npm install

# Rails dependencies
cd server && bundle install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### Run the Rails Server

```bash
cd server
rails server
```

Server will start at http://localhost:4000 with GraphQL endpoint at `/graphql`

### Verify the Schema

You can verify that GraphQL Ruby has the `@oneOf` directive:

```bash
cd server
rails runner "puts ServerRailsSchema.to_definition"
```

You'll see `input SearchFilterInput @oneOf {` in the output.

### Run the Client

```bash
# In a separate terminal
cd client
npm run dev
```

Client will start at http://localhost:5173

### Generate Types

**Important:** The Rails server must be running before generating types since codegen uses introspection.

```bash
# With server running, in project root:
npm run codegen
```

Check the generated files in the `generated/` directory to see how the `@oneOf` directive that's present in the Rails schema is not included in `generated/schema.graphql`.

## Configuration

The GraphQL Codegen configuration (`codegen.ts`) queries the Rails backend via introspection:

```typescript
const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',  // ← Queries Rails GraphQL endpoint
  generates: {
    './generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: { includeDirectives: true },
    },
    './generated/types.ts': {
      plugins: ['typescript'],
    },
  },
};
```

**Note:** Even with `includeDirectives: true`, the `@oneOf` directive is not included during introspection.

## Technical Details

### About GraphQL Introspection

The behavior observed in this demo relates to how GraphQL introspection works:

1. **GraphQL Ruby defines `@oneOf`**: When you dump the schema with `ServerRailsSchema.to_definition`, the directive is present
2. **Introspection doesn't include it**: The standard GraphQL introspection query doesn't currently return applied directives on input types
3. **Codegen works with introspection data**: GraphQL Codegen can only work with what the introspection query returns

### Practical Impact

This creates a gap between server-side and client-side type safety:
- **Server-side**: GraphQL Ruby validates the `@oneOf` constraint at runtime
- **Client-side**: TypeScript types don't enforce the constraint, which could allow invalid inputs to be constructed

## Potential Areas for Enhancement

This repository can help discuss potential improvements in several projects:

### GraphQL Codegen
1. **Documentation**: Document the current behavior with `@oneOf` directives and introspection
2. **typescript plugin**: Consider adding support for generating union types when `@oneOf` information is available (either through introspection enhancements or alternative schema sources)

### GraphQL Spec / Implementations
Consider enhancing introspection to include applied directives on input types, which would enable better tooling support for directives like `@oneOf`
