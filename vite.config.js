import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to process includes and EJS expressions
function templatePlugin() {
  return {
    name: 'template-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const filename = ctx.filename || '';
        let activePage = 'create';
        if (filename.includes('list-documents')) activePage = 'list';
        else if (filename.includes('login') || filename.includes('register')) activePage = 'auth';
        
        // Process includes recursively
        function processIncludes(content, depth = 0) {
          if (depth > 10) return content; // Prevent infinite loops
          
          const includeRegex = /<%- include\('([^']+)',?\s*(\{[^}]*\})?\s*\) %>/g;
          let result = content;
          let hasIncludes = false;
          
          result = result.replace(includeRegex, (match, componentPath, dataStr) => {
            hasIncludes = true;
            try {
              const fullPath = resolve(process.cwd(), `${componentPath}.html`);
              
              if (!fs.existsSync(fullPath)) {
                console.warn(`Component not found: ${fullPath}`);
                return '';
              }
              
              let componentHtml = fs.readFileSync(fullPath, 'utf-8');
              
              // Parse data if provided
              if (dataStr) {
                const dataObj = {};
                const cleanData = dataStr.replace(/[{}]/g, '').trim();
                
                if (cleanData) {
                  cleanData.split(',').forEach(pair => {
                    const colonIndex = pair.indexOf(':');
                    if (colonIndex > -1) {
                      const key = pair.substring(0, colonIndex).trim();
                      let value = pair.substring(colonIndex + 1).trim();
                      value = value.replace(/^['"]|['"]$/g, '');
                      dataObj[key] = value;
                    }
                  });
                }
                
                dataObj.activePage = activePage;
                
                // Replace <%= var %> in component
                for (const [key, value] of Object.entries(dataObj)) {
                  const regex = new RegExp(`<%=\\s*${key}\\s*%>`, 'g');
                  componentHtml = componentHtml.replace(regex, value);
                }
              }
              
              // Process conditional expressions <%= condition ? 'a' : 'b' %>
              const conditionalRegex = /<%=\s*activePage\s*===\s*'([^']+)'\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\s*%>/g;
              componentHtml = componentHtml.replace(conditionalRegex, (match, page, trueVal, falseVal) => {
                return activePage === page ? trueVal : falseVal;
              });
              
              return componentHtml;
            } catch (error) {
              console.error(`Error processing include: ${match}`, error);
              return '';
            }
          });
          
          // If we found includes, process again to handle nested includes
          if (hasIncludes) {
            result = processIncludes(result, depth + 1);
          }
          
          return result;
        }
        
        return processIncludes(html);
      },
    },
  };
}

export default defineConfig({
  root: '.', 
  base: './', 
  
  plugins: [
    templatePlugin(),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        list: resolve(process.cwd(), 'list-documents.html'),
        login: resolve(process.cwd(), 'login.html'),
        register: resolve(process.cwd(), 'register.html'),
      },
    },
    assetsDir: 'assets',
  },

  server: {
    port: 3000,
    open: true,
  },

  publicDir: 'public',
});
