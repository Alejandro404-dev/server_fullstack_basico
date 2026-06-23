import express from "express" // framework para crear aplicaciones web
import router from "./router"
import cors from "cors" // Ya no necesitamos importar CorsOptions

const app = express() // creamos una nueva app de Express (nuestro servidor)

app.use(express.json())

/* Desde el frontend sale una peticion. esa peticion llega al server y pasa por express.json()
    express.json() hace que esa peticion sea legible
    El sistema procesa esa peticion con prisma y, ahi decide que hace con esa peticion

        Ejemplo:
        {
            "name": "Lapicera",
            "price": 10
        }
    el middleware express.json() lee el boddy y lo convierte a un objeto javaScript
    Ahora podemos hacer req.body.name y obtener "Lapicera"
*/

// CORS - SOLUCIÓN ABIERTA (Permite a cualquier origen conectarse al backend)
app.use(cors())

app.use('/api/products', router) // le decimos a la app que use el router para las rutas que empiecen con /api/products  

// 404 - "Not found": se ejecuta si ninguna ruta contesta a la peticion  
app.use((req, res, _next) => {
    res.status(404).json({
        error: 'No encontrado - Not found',
        path: req.originalUrl, // ruta que intentaron acceder
        method: req.method // metodo de la peticion (GET, POST, etc...)
    })
})

// ---- Manejador de errores GLOBAL (500 y otros errores) ----
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error Handler: ', err)
    const isDev = process.env.NODE_ENV !== 'production' // si no estamos en produccion, mostramos el error completo (stack trace)

    const payload: Record<string, any> = {
        error: 'Internal server error',
        tip: 'Revisa la consola del servidor para mas detalles'
    }

    // si estamos en desarrollo, agregamos mas detalles tecnicos
    if (isDev) {
        payload.details = {
            message: err?.message,
            stack: err?.stack
        }
    }
    
    // Elegimos el status HTTP:
    const status = typeof err?.status === 'number' ? err.status : 500

    //Enviamos la respuesta JSON al cliente con el status
    res.status(status).json(payload)
})

console.log(process.env.DATABASE_URL)
export default app