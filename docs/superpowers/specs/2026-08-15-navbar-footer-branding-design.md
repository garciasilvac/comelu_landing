# Diseño: marca compartida en navbar y footer

## Objetivo

Usar el SVG horizontal entregado por el usuario como marca visual tanto en el navbar como en el footer, y dar a ambas superficies el mismo fondo `sky-700`.

## Alcance

- Copiar el SVG a los assets públicos del sitio para que Vite lo sirva sin transformaciones.
- Adaptar únicamente el color de fondo azul del SVG desde `#0363CF` a `#0369A1`, equivalente a Tailwind `sky-700`, para integrarlo con ambas superficies.
- Reemplazar la marca construida con la letra “C” y el texto “Comelu” del navbar por el SVG.
- Reemplazar el texto de marca “Comelu” del footer por el mismo SVG.
- Aplicar `bg-sky-700` al navbar y al footer.
- Ajustar colores de navegación, botones, bordes y texto secundario solo cuando sea necesario para mantener contraste y estados de foco visibles.

## Fuera de alcance

- No se cambia la estructura de navegación ni su comportamiento.
- No se modifica el contenido del formulario, las secciones centrales ni la paleta global.
- No se altera el archivo original ubicado en Descargas.
- No se agregan animaciones.

## Implementación propuesta

El archivo se publicará como `/comelu-horizontal.svg` y se renderizará con elementos `<img>` descriptivos en ambos componentes. La imagen conservará su proporción mediante `object-contain` y tendrá tamaños independientes adecuados para el navbar y el footer.

El enlace de inicio del navbar conservará su nombre accesible actual. En el footer, la marca se incluirá dentro del bloque informativo existente, sin convertirla en un enlace nuevo.

## Accesibilidad y estados interactivos

- El logo del navbar tendrá texto alternativo coherente con su función de volver al inicio.
- El logo del footer tendrá texto alternativo de marca.
- Los enlaces y botones sobre `sky-700` usarán colores claros con contraste legible.
- Los estados `hover` y `focus-visible` existentes seguirán siendo distinguibles.
- El menú móvil mantendrá su superficie actual para no ampliar el alcance del cambio.

## Pruebas y verificación

- Añadir una prueba de regresión que confirme que el logo compartido aparece en navbar y footer.
- Comprobar que ambos elementos semánticos usan `bg-sky-700`.
- Ejecutar `pnpm test` y `pnpm build`.
- Iniciar el sitio localmente y revisar visualmente las versiones de escritorio y móvil, incluyendo contraste y ausencia de errores en consola.

## Riesgos y rollback

El principal riesgo es que el lienzo amplio del SVG reduzca visualmente la marca a tamaños pequeños. Se mitigará ajustando las dimensiones del `<img>` sin recortar el arte. El rollback consiste en revertir por separado el commit del asset, el de pruebas o el de los componentes y estilos.
