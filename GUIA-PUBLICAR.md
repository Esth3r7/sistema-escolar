# Guía definitiva: GitHub → Cloudflare → Base de datos

Orden recomendado: **1) GitHub, 2) Cloudflare Pages, 3) Base de datos (D1)**.
Haz cada parte completa y pruébala antes de pasar a la siguiente.

> Todos los comandos se escriben en la terminal de VS Code, dentro de la carpeta donde está `package.json`
> (la de adentro: `...\plataforma-educativa\plataforma-educativa`). Comprueba con `dir` que ves `index.html` y `src`.

---------------------------------------------------------------------

## PARTE 0 · Qué instalar (una sola vez)

| Qué | Dónde | Para qué |
|---|---|---|
| Node.js (versión LTS, 18 o mayor) | https://nodejs.org | `npm`, Vite |
| Git | https://git-scm.com/download/win | subir el código |
| VS Code | ya lo tienes | editar |
| Cuenta de GitHub | https://github.com | guardar el código |
| Cuenta de Cloudflare | https://dash.cloudflare.com/sign-up | publicar la web y la base de datos |

Comprueba en la terminal: `node -v` y `git --version` (deben mostrar un número).

---------------------------------------------------------------------

## PARTE 1 · Subir el proyecto a GitHub

1. Entra a https://github.com/new
2. **Repository name:** `sistema-escolar` · marca **Private** (privado) · NO marques "Add README" · pulsa **Create repository**.
3. GitHub te muestra una dirección parecida a `https://github.com/TU-USUARIO/sistema-escolar.git`. Cópiala.
4. En la terminal de VS Code (carpeta correcta), escribe **una línea a la vez**:

```
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
git init
git add .
git commit -m "Primera versión del sistema escolar"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sistema-escolar.git
git push -u origin main
```

5. La primera vez se abre una ventana del navegador para iniciar sesión en GitHub. Acepta.
6. Recarga la página del repositorio: deben aparecer `src`, `index.html`, `package.json`, etc.

**Para subir cambios después (siempre estos 3 comandos):**
```
git add .
git commit -m "Describe qué cambiaste"
git push
```

Qué NO se sube (ya está en `.gitignore`): `node_modules`, `dist`.

---------------------------------------------------------------------

## PARTE 2 · Publicar en Cloudflare Pages (gratis)

1. Entra a https://dash.cloudflare.com
2. Menú **Workers & Pages → Create (Crear) → Pages → Connect to Git**.
3. **Autoriza** a Cloudflare a ver tu GitHub y elige el repositorio `sistema-escolar`.
4. Configura así:

| Campo | Valor |
|---|---|
| Framework preset | **Vite** (o None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (déjalo vacío) |

5. Si el build falla por la versión de Node: en **Environment variables** agrega `NODE_VERSION` = `22`.
6. Pulsa **Save and Deploy**. En 1–2 minutos tendrás una dirección `https://sistema-escolar.pages.dev`.
7. Desde ahora, cada `git push` publica automáticamente la versión nueva.

Notas:
- El sistema usa rutas con `#` (ej. `/#grades`), así que NO necesita configuración extra al recargar la página.
- Dominio propio (ej. `colegio.edu.do`): en el proyecto → **Custom domains**. El dominio se compra aparte.
- Las pantallas de Cloudflare cambian de vez en cuando. Si no ves exactamente estos nombres, busca "Pages" / "Connect to Git".

**Alternativa sin Git (rápida, para mostrar hoy):**
```
npm run build
npx wrangler login
npx wrangler pages deploy dist
```

---------------------------------------------------------------------

## PARTE 3 · Base de datos

### ¿"One" o "Node"?
- **D1** (se lee "D uno") = la base de datos de Cloudflare. Es probablemente lo que recuerdas ("one").
- **Node.js** NO es una base de datos: es el programa que permite correr código (ya lo usas con `npm`).

### Cómo queda la arquitectura
```
Navegador (la web en Cloudflare Pages)
      │  pide datos
      ▼
API (carpeta /functions → Pages Functions)   ← valida usuario y contraseña
      │
      ▼
Base de datos D1 (SQLite de Cloudflare)
```

### Estado actual (importante)
Hoy los datos viven en el navegador de cada dispositivo (localStorage). Por eso un docente NO ve lo que
escribió Dirección en otro aparato. Para compartir datos entre todos hace falta la base de datos.

### Etapa 3A · Crear la base de datos (en la terminal)
```
npx wrangler login
npx wrangler d1 create escuela-db
```
Anota el `database_id` que aparece. Luego crea un archivo `schema.sql` (tablas: usuarios, estudiantes, docentes,
asistencia, notas, pagos…) y cárgalo:
```
npx wrangler d1 execute escuela-db --remote --file=schema.sql
```
Después, en Cloudflare: tu proyecto Pages → **Settings → Bindings → Add → D1 database**, nombre de variable `DB`.

### Etapa 3B · Conectar el sistema (lo que falta programar)
1. Crear la carpeta `functions/api/` con los puntos de acceso (login, estudiantes, notas…).
2. Cambiar el archivo `src/services/storage.js`: es el ÚNICO lugar que habla con los datos. Se sustituye el
   guardado local por llamadas a `/api/...` usando `db.use(...)`.
3. Reemplazar el login de demostración por uno real (contraseñas cifradas, sesiones).

### Límites gratis de D1 (consulta la página oficial antes de decidir, pueden cambiar)
Revisados en noviembre de 2026: 5 millones de filas leídas por día, 100 000 filas escritas por día y 5 GB de
almacenamiento. Plan de pago: desde 5 USD al mes. Para un colegio mediano el plan gratis suele alcanzar al inicio.

### ⚠️ Antes de usar datos reales de estudiantes
- Las contraseñas actuales (`admin1234`…) son SOLO de demostración. No las uses con datos reales.
- Debe existir login real con contraseñas cifradas y permisos por rol en el servidor, no solo en la pantalla.
- Hay datos de menores de edad: define quién puede verlos, haz copias de seguridad y consulta lo que
  exige la normativa de protección de datos que aplique al colegio.

---------------------------------------------------------------------

## Si algo falla
| Mensaje | Causa probable | Solución |
|---|---|---|
| `Missing script: "dev"` | estás en la carpeta de afuera | `cd` a la carpeta que tiene `package.json` |
| `"vite" no se reconoce` | falta instalar | `npm install` |
| `git: no se reconoce` | Git no instalado o terminal vieja | instala Git y reinicia VS Code |
| `Permission denied` / pide login en git push | no iniciaste sesión en GitHub | repite `git push` y acepta la ventana del navegador |
| Cloudflare: "no such file" | carpeta de salida mal puesta | Build output directory = `dist` |
| Cloudflare: "command not found" | versión de Node | variable `NODE_VERSION` = `22` |
