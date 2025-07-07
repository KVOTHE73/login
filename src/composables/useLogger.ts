/**
 * @file useLogger.ts
 * @description Composable para manejar logs en el entorno de desarrollo, tipado con TypeScript.
 */

/**
 * Selecciona solo los métodos de consola que queremos exponer.
 */
type ConsoleMethods = Pick<
  typeof console,
  "debug" | "log" | "info" | "warn" | "error"
>;

/**
 * Logger tipado: para cada método de consola, acepta un subtag y luego los mismos parámetros que el método original.
 */
export type Logger = {
  [K in keyof ConsoleMethods]: (
    subtag: string,
    ...args: Parameters<ConsoleMethods[K]>
  ) => void;
};

/**
 * Función base que envía mensajes a la consola solo en modo DEV.
 * @param level Nivel de consola: "debug" | "log" | "info" | "warn" | "error"
 * @param tag Texto de cabecera para el mensaje.
 * @param args Parámetros adicionales a mostrar.
 */
export function logDev(
  level: keyof ConsoleMethods,
  tag: string,
  ...args: any[]
): void {
  if (import.meta.env.DEV) {
    const method = console[level] as (...args: any[]) => void;
    method(
      `%c${tag}%c`,
      "background: #e0f0ff; color: #005bcc; padding:2px 4px; border-radius:3px;",
      "",
      ...args
    );
  }
}

/**
 * Crea un logger contextualizado en un fichero.
 * @param file Nombre o ruta del archivo (p.ej. '@stores/checkTimeStore.ts')
 * @returns Un objeto Logger con métodos debug, log, info, warn y error.
 */
export function createLogger(file: string): Logger {
  const wrap =
    (level: keyof ConsoleMethods) =>
    (subtag: string, ...args: any[]) => {
      logDev(level, `${file} => ${subtag}`, ...args);
    };

  return {
    debug: wrap("debug"),
    log: wrap("log"),
    info: wrap("info"),
    warn: wrap("warn"),
    error: wrap("error"),
  };
}

/**
 ** console.debug(...) **
– Pensado para mensajes muy detallados, de “traza” o “step-by-step” en el desarrollo.
– En la mayoría de navegadores viene filtrado por defecto (oculto) y solo aparece si activas explícitamente 
    el nivel “Verbose” o “Debug” en la pestaña de consola.
– Úsalo para todo lo que sea muy verboso (e.g. cada vez que entra en un bucle, cada micro-paso de un proceso, 
    payload completo de la petición/respuesta, etc.).

** console.log(...) **
– Mensajes “normales”, de propósito general.
– Se ven siempre (a menos que filtres tú).
– Ideal para resultados relevantes de una operación —p.ej. “API OK: ya recibí estos datos” o “estado actual de la UI”—

** console.info(...) **
– Similar a log, pero semánticamente indica “información importante” (aparece con un ícono o color distinto en algunas DevTools).
– Úsalo para notificar eventos clave: “usuario autenticado”, “configuración cargada”, etc.

** console.warn(...) **
– Para advertencias: datos inesperados pero tolerables, de los que el usuario o el equipo quizá deba enterarse.
– Se muestra con un icono de “triángulo” y color amarillo.

** console.error(...) **
– Para errores graves: excepciones capturadas, fallo de recursos, errores de validación.
– Se muestra con icono de “cruz” y color rojo, e incluso genera stack trace.
 */
