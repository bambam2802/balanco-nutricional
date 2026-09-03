// Publica o build (dist/index.html) na branch gh-pages do GitHub Pages.
// Uso: npm run publicar
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const raiz = process.cwd()
const run = (cmd, cwd = raiz) => execSync(cmd, { cwd, stdio: 'inherit' })

console.log('> Gerando o build (npm run build)')
run('npm run build')

const dist = join(raiz, 'dist', 'index.html')
if (!existsSync(dist)) {
  console.error('dist/index.html não foi gerado.')
  process.exit(1)
}

const wt = mkdtempSync(join(tmpdir(), 'gh-pages-'))
try {
  console.log('> Preparando a branch gh-pages')
  run(`git worktree add --detach "${wt}" HEAD`)
  run('git checkout -q --orphan gh-pages', wt)
  run('git rm -rfq .', wt)
  cpSync(dist, join(wt, 'index.html'))
  writeFileSync(join(wt, '.nojekyll'), '')
  run('git add -A', wt)
  run(`git commit -qm "publicar: build ${new Date().toISOString().slice(0, 10)}"`, wt)
  console.log('> Enviando para o GitHub')
  run('git push -q --force origin gh-pages', wt)
  console.log('Publicado. O site atualiza em 1 a 2 minutos.')
} finally {
  try {
    run(`git worktree remove --force "${wt}"`)
  } catch {
    rmSync(wt, { recursive: true, force: true })
  }
}
