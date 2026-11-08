import { Router } from "express"
import { crearProducto, editarProducto, eliminarProducto, listarProductos } from "../controllers/productController"
import { validateBody } from "../middleware/validate"
import { ProductCreateSchema, ProductIdParamsSchema, ProductPatchSchema } from "../validators/product.schema"
import { validateParams } from "../middleware/validateParams"

const router = Router()

//Rutas

//para obtener datos de la base de datos
router.get('/', listarProductos)

//para enviar datos a la base de datos
router.post('/', validateBody(ProductCreateSchema), crearProducto)

// para editar datos de la base de datos
router.patch('/:id', validateBody(ProductPatchSchema), editarProducto)

//para elimiar datos de la base de datos
router.delete('/:id', validateParams(ProductIdParamsSchema), eliminarProducto)

export default router