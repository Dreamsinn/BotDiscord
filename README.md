Estructura del bot

============= main =============
 - Ejecutar lo necesario para que el bot funcione


======== Infrastructure ========
 - Conexion con la Api de discord
 - Conexion con otras API
 - Conexion con bd, si necesario
 - Ejecucion de comandos

========== Aplication ==========
 - Aplicacion de los comandos
 - Sera llamada de infrastructure para la ejecucion

============ Domain ============
 - Comandos
 - Interfices necesarias para domino, si necesarias
 - Esquemas de bd, si necesario


========= ENCENDER BOT =========
           yarn serve