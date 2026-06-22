import { Router } from "express"
import { crearProducto, listarProductos } from "../controllers/productController"
import { validateBody } from "../middleware/validate"
import { ProductCreateSchema } from "../validators/product.schema"

const router = Router()

//Rutas

//para obtener datos de la base de datos
router.get('/', listarProductos)

//para enviar datos a la base de datos
router.post('/', validateBody(ProductCreateSchema), crearProducto)

// para editar datos de la base de datos
router.put('/', (req, res) => {
    res.json("Desde PUT")
})

//para elimiar datos de la base de datos
router.delete('/', (req, res) => {
    res.json("Desde DELETE")
})

export default router