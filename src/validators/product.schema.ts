import { minLength, minValue, number, object, pipe, string } from "valibot";

export const ProductCreateSchema =  object({
    name: pipe(
        string('name debe ser Texto'),
        minLength(1, 'name es requerido')
    ),
    price: pipe(
        number('price debe ser un numero'),
        minValue(0.01, 'price debe ser > 0' )
    )
}) 