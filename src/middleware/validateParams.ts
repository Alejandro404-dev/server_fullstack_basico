import { message, safeParse, type BaseSchema } from "valibot";
import { Request, Response, NextFunction } from "express";
import path from "node:path";

export function validateParams<TSchema extends BaseSchema<any, any, any>>(schema: TSchema) {

    return (req: Request, res: Response, next: NextFunction) => {
        //1- copiamos los params
        const rawParams: Record<string, any> = { ...req.params }

        //2 - Si el parametro (params) se llama id ( DELETE/:id ), lo convertimos a numero
        if (typeof rawParams.id !== "undefined") {
            rawParams.id = Number(rawParams.id)
        }

        //3 - Validamos los params convertidos contra el schema que tenemos 
        const parsed = safeParse(schema, rawParams)

        //4 - Sila validacion falla.
        // - armamos un arreglo de errores
        // - devolvemos 400
        if (!parsed.success) {
            const errors = parsed.issues.map(informacion => ({
                path: informacion.path?.map(p => ('key' in p ? p.key : p.index)).join('.') || 'params',
                message: informacion.message
            }))

            return res.status(400).json({ errors })

        }
        // 5 - si la validacion pasa
        // - parsed output es la version ya validada y limpia
        req.params = parsed.output as any

        // 6 - llamamos a next para que siga el flujo normal
        next()
    }
}