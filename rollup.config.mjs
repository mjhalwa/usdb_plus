// export default {
//   input: {
//     highlight_detail_page: 'scripts/highlight_detail_page.js',
//     highlight_search_results: 'scripts/highlight_search_results.js',
//     options: 'options/options.js'
//   },
//   output: {
//     dir: 'dist',
//     // format: 'iife',
//     entryFileNames: '[name].bundle.js',
//     intro: '' // Removes `"use strict";`
//   }
// };

export default [
  {
    input: 'src/highlight_detail_page.js',
    output: {
      file: 'scripts/highlight_detail_page.bundle.js',
      // format: 'iife',  // Removes "use strict";
      // format: 'es', // tells Rollup to generate native ES modules (supporting async/await at top level)
    }
  },
  {
    input: 'src/highlight_search_results.js',
    output: {
      file: 'scripts/highlight_search_results.bundle.js',
      // format: 'iife',  // Removes "use strict";
      // format: 'es', // tells Rollup to generate native ES modules (supporting async/await at top level)
    }
  },
  {
    input: 'src/options.js', // Entry for options.js
    output: {
      file: 'options/options.bundle.js', // Output in the same directory as options.html
      // format: 'iife',  // Removes "use strict";
      // format: 'es', // tells Rollup to generate native ES modules (supporting async/await at top level)
    }
  }
];