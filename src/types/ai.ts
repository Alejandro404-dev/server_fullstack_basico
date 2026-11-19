// Estadisticas que calcula el backend sobre todo el catalogo

export interface EstadisticasCatalogo {
    cantidadDeProductos: number
    PrecioPromedio: number
    PrecioMaximo: number
    PrecioMinimo: number
}

// Respuesta JSON   que devuelve el enpoint GET => /api/ia/product-profile
// Incluye el texto generado por la IA y las estadisticas
export interface RespuestaAnalisisCatalogo {
    analisisIA: string
    estadisticasCatalogo: EstadisticasCatalogo
}

// Errores o respuesta vacias
export const RESPUESTA_ANALISIS_VACIA: RespuestaAnalisisCatalogo = {
    analisisIA: "No hay productos cargados todavia, no puedo analizar el catalogo",
    estadisticasCatalogo: {
        cantidadDeProductos: 0, PrecioPromedio: 0, PrecioMaximo: 0, PrecioMinimo: 0
    }
}
