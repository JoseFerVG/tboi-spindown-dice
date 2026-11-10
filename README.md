# 🎲 Spindown Dice Calculator • The Binding of Isaac: Repentance

Una calculadora interactiva, precisa y con la estética visual auténtica de **The Binding of Isaac: Repentance** para calcular todas las transformaciones, rutas inversas, distancias y sinergias del **Spindown Dice (Dado Reductor)**.

🌐 **Demo en vivo:** [https://josefervg.github.io/tboi-spindown-dice/](https://josefervg.github.io/tboi-spindown-dice/)

---

## ⚡ Características Principales

1. **Cadena Directa (Forward Reroll Chain):**
   - Elige cualquier objeto colocado en el pedestal.
   - Observa toda la cadena descendente de objetos a los que llegará el Spindown Dice (ID - 1).
   - Botón interactivo para simular el giro del dado directamente en el pedestal con sonido auténtico del D6.
   - Resaltado especial para objetos **Tier Dios (Calidad 4)** como *Death Certificate, Sacred Heart, Brimstone, Godhead, C-Section, Glitched Crown*.

2. **Búsqueda Inversa (Reverse Target Search):**
   - ¿Quieres un objeto específico (ej. *Certificado de Defunción* o *Sagrado Corazón*)?
   - Te muestra exactamente qué objetos en la partida se convierten en tu objetivo y cuántas cargas/giros necesitas.
   - Resalta objetos que están a solo **1 giro**.

3. **Calculadora de Distancia Exacta (Ítem A ➜ Ítem B):**
   - Elige un ítem de origen y un ítem de destino.
   - Calcula la cantidad de giros necesarios, salas de recarga y el recorrido paso a paso.

4. **Sinergias y Modificadores de Batería:**
   - **Batería de Coche (Car Battery):** Realiza 2 activaciones consecutivas (ID - 2). La calculadora detecta la paridad y te avisa si el salto sobrepasará tu objetivo (distancia impar) y cómo evitarlo.
   - **9 Volt:** Descuenta 1 sala de carga requerida (5 salas en vez de 6).
   - **The Battery:** Simula la doble barra de carga del HUD de Isaac.

5. **Atajos Legendarios (God-Tier Combos):**
   - Colección de los mejores trucos descubiertos por la comunidad (ej. *Bot Fly ➜ Death Certificate*, *Toothpicks ➜ Sacred Heart*, *Scissors ➜ Godhead*, *Blood Bag ➜ C-Section*).

6. **Estética 100% Isaac:**
   - Tipografía retro de pixel art y notas manuscritas al estilo del diario de Isaac.
   - Altar de pedestal con haz de luz celestial y sombras dinámicas.
   - HUD de 6 pips de batería idéntico al juego original.
   - Efecto de sonido real del **D6 Roll**.
   - Selector rápido con filtros por Calidad (Q0 a Q4) y Tipo de Sala (Treasure, Shop, Boss, Devil, Angel, Secret).
   - Gestor de ítems bloqueados / desbloqueados (soporte para partidas al 100% o partidas en progreso).
   - Totalmente bilingüe: Español (🇪🇸) e Inglés (🇺🇸).

---

## 🚀 Ejecución en Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

O simplemente ejecuta el archivo `ABRIR CALCULADORA.bat` para abrirla directamente en tu navegador sin dependencias ni conexión a internet.

---

## 📜 Créditos

- Sprites, iconos y efectos de sonido extraídos de *The Binding of Isaac: Repentance* © Nicalis, Inc. & Edmund McMillen.
- Desarrollado con React, Tailwind CSS y Vite.
