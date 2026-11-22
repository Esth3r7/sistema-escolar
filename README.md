# Sistema de Gestión Escolar (prueba piloto)

## Ver el sistema (lo más fácil)
Doble clic en **INICIAR.bat**. La primera vez instala solo; las siguientes abre directo en http://localhost:5173

## Con VS Code
Abre ESTA carpeta (la que contiene package.json) con Archivo → Abrir carpeta.
La primera vez, acepta "Allow automatic tasks"; desde entonces el sistema arranca solo al abrir la carpeta.
(Manual: terminal → `npm run dev`. `npm install` solo se hace una vez.)

## Sin instalar nada
Doble clic en `demo-sin-servidor.html`.

## Usuarios de demostración
admin / admin1234 · docente / docente1234 · estudiante / estudiante1234 · padre / padre1234

## Publicar y base de datos
Ver GUIA-PUBLICAR.md

## Publicar cambios (Cloudflare)
La carpeta `dist/` ya viene lista y se sube a GitHub. Flujo: editar → `npm run build` → `git add .` → `git commit -m "cambio"` → `git push`.
