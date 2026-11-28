# Supabase browser bundle

From this directory with Node.js 24 and npm, run:

```sh
npm ci --ignore-scripts
npm audit signatures
node build.mjs
```

The build generates a standalone browser ES module and its third-party licence notices in
`src/vendor/`. Commit both outputs with the npm lockfile. The static GitHub Pages site
loads the committed module directly and needs no build step.

The official [npm package](https://www.npmjs.com/package/@supabase/supabase-js/v/2.117.3)
is pinned to 2.117.3. Its registry tarball has this SHA-512 Subresource Integrity digest:

```text
sha512-K+f8PimXDunPWQ63CKRXaF5pbVPJxmfw5ryAnh0s9S9PkwcuqBjiSpIaqpF7KLDljeYwXIL85ST8QxaO0+XuvA==
```

The lockfile supplies registry integrity checks for the transitive dependencies.
The build rejects any runtime imports in the generated module.
