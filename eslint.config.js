import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier/recommended'

// eslint-plugin-react-hooks 7 отдаёт конфиг со строковым массивом plugins,
// а flat config требует объект — нормализуем его здесь
export const reactHooksRecommended = {
  ...reactHooks.configs['recommended-latest'],
  plugins: { 'react-hooks': reactHooks },
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooksRecommended,
      reactRefresh.configs.vite,
      prettier, // Предотвращает конфликты между правилами форматирования ESLint и Prettier
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  }
)