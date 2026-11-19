import Groq from "groq-sdk";
import { Request, Response } from "express";
import { Product } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { EstadisticasCatalogo, RESPUESTA_ANALISIS_VACIA, RespuestaAnalisisCatalogo } from "../types/ai";



export async function aiController(req: Request, res: Response) {

    // 1 - creamos el cliente de groq con nuestra API key que tenemos en el archivo .env
    const groqCliente = new Groq({ apiKey: process.env.GROQ_API_KEY })

    //1- Traemos TODOS los productos con tipado estricto del modelo Prisma
    const listarProductos: Product[] = await prisma.product.findMany({
        orderBy: { id: "asc" },
    })
    // 2 - si no hay productos, devolvemos una respuesta minima y ya tipado / NO llamamos a la IA (estos nos ahorrra tiempo y dinero)
    if (listarProductos.length === 0) {
        return res.json(RESPUESTA_ANALISIS_VACIA)
    }
    //3 - Calculamos estadisticas simples 
    const cantidadDeProductos: number = listarProductos.length
    const listaDePrecios: number[] = listarProductos.map((producto) => producto.price)
    const sumaDePrecio: number = listaDePrecios.reduce((acumulado, precio) => acumulado + precio, 0)
    const PrecioPromedio: number = sumaDePrecio / cantidadDeProductos
    const PrecioMaximo: number = Math.max(...listaDePrecios)
    const PrecioMinimo: number = Math.min(...listaDePrecios)

    // --------------------------- PROMPT IA --------------------------------
    // 4- armamos el prompt (texto) para la IA: que datos le damos y que queremos devuelta

    const promptAnalisis: string = `
    Sos un analista de catalogo. te paso el listado completo de productos y estadisticas.
    responde en español con:
    1) Un perfil general del catalogo.
    2) Posibles problemas u omisiones.
    3) Oportunidades de mejora.
    4) un campo adicional que convendria agregar para segmentar mejor.
    
    PRODUCTOS_JSON: ${JSON.stringify(listarProductos)}
    ESTADISTICAS:
                    - cantidadDeProductos: ${cantidadDeProductos}
                    - precioPromedio: ${PrecioPromedio}
                    - precioMaximo:${PrecioMaximo}
                    - precioMinimo:${PrecioMinimo}
    `.trim()
    //-------------------------------LLAMAMOS A LA IA------------
    //5 - Llamamos a la IA con el SDK de Groq

    try {
        //5.1 - preparamos la llamada al modelo
        const respuestaGroq = await groqCliente.chat.completions.create({
            model: "openai/gpt-oss-120b",                  //Modelo rapido y economico creado por meta
            // role "system" - reglas generales que debe adoptar el modelo de IA
            //role "user" - nuestro pedido concreto
            messages: [
                {
                    role: "system",
                    content: "Sos un asistente experto en analisis de catalogos de productos"
                },
                { role: "user", content: promptAnalisis }
            ]
        })

        // 5.2 Extraemos solo el texto que escrtibio la IA
        // - La respuesta, generalmente vuelve asi => {choices: [ {messege: { content: "texto IA"} } ] }
        // - ? si algo no existe, no rompe, seguimos.
        // - ?? Si quedo undefined / null, mostramos el texto en el que la IA no devuelve
        const contenidoGeneradoIA: string = respuestaGroq.choices?.[0]?.message.content ?? "La IA no devolvio contenido."

        //5.3 -Armamos el objeto de estadisticas
        const estadisticasCatalogo: EstadisticasCatalogo = { cantidadDeProductos, PrecioPromedio, PrecioMaximo, PrecioMinimo }

        //5.4 Armamos el objeto final que va al frontend
        const respuestaAnalisisCatalogo: RespuestaAnalisisCatalogo = {
            analisisIA: contenidoGeneradoIA, estadisticasCatalogo
        }

        // 5.5 Devolvemos todo en formato JSON
        return res.json(respuestaAnalisisCatalogo)

    } catch (error) {
        console.error("La llamada a la IA ha dado el siguiente errore:", error)

    }

}
