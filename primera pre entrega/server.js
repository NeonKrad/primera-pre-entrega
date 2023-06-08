const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(express.json());

// Rutas para productos
const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
  // Lógica para obtener todos los productos de la base de datos (productos.json)
  const products = obtenerProductos();
  res.json(products);
});

productsRouter.get('/:pid', (req, res) => {
  // Lógica para obtener un producto específico por su ID
  const product = obtenerProductoPorId(req.params.pid);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

productsRouter.post('/', (req, res) => {
  // Lógica para agregar un nuevo producto a la base de datos (productos.json)
  const newProduct = req.body;
  agregarProducto(newProduct);
  res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
  // Lógica para actualizar un producto existente por su ID
  const productId = req.params.pid;
  const updatedProduct = req.body;
  actualizarProducto(productId, updatedProduct);
  res.json(updatedProduct);
});

productsRouter.delete('/:pid', (req, res) => {
  // Lógica para eliminar un producto por su ID
  const productId = req.params.pid;
  eliminarProducto(productId);
  res.json({ message: 'Producto eliminado correctamente' });
});

// Rutas para carritos
const cartsRouter = express.Router();

cartsRouter.post('/', (req, res) => {
  // Lógica para crear un nuevo carrito
  const newCart = req.body;
  crearCarrito(newCart);
  res.status(201).json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
  // Lógica para obtener los productos de un carrito específico
  const cartId = req.params.cid;
  const cartProducts = obtenerProductosDeCarrito(cartId);
  if (cartProducts) {
    res.json(cartProducts);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  // Lógica para agregar un producto a un carrito
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity;
  agregarProductoAlCarrito(cartId, productId, quantity);
  res.json({ message: 'Producto agregado al carrito correctamente' });
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Funciones auxiliares para manipular los datos de productos y carritos
function obtenerProductos() {
  const productsData = fs.readFileSync('productos.json', 'utf8');
  return JSON.parse(productsData);
}

function obtenerProductoPorId(productId) {
  const products = obtenerProductos();
  return products.find(product => product.id === productId);
}

function agregarProducto(newProduct) {
  const products = obtenerProductos();
  newProduct.id = generarIdUnico(products);
  products.push(newProduct);
  guardarProductos(products);
}

function actualizarProducto(productId, updatedProduct) {
  const products = obtenerProductos();
  const index = products.findIndex(product => product.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    guardarProductos(products);
  }
}

function eliminarProducto(productId) {
  const products = obtenerProductos();
  const filteredProducts = products.filter(product => product.id !== productId);
  guardarProductos(filteredProducts);
}

function crearCarrito(newCart) {
  const cartsData = fs.readFileSync('carrito.json', 'utf8');
  const carts = JSON.parse(cartsData);
  newCart.id = generarIdUnico(carts);
  carts.push(newCart);
  guardarCarritos(carts);
}

function obtenerProductosDeCarrito(cartId) {
  const cartsData = fs.readFileSync('carrito.json', 'utf8');
  const carts = JSON.parse(cartsData);
  const cart = carts.find(cart => cart.id === cartId);
  return cart ? cart.products : null;
}

function agregarProductoAlCarrito(cartId, productId, quantity) {
  const cartsData = fs.readFileSync('carrito.json', 'utf8');
  const carts = JSON.parse(cartsData);
  const cartIndex = carts.findIndex(cart => cart.id === cartId);
  if (cartIndex !== -1) {
    const cart = carts[cartIndex];
    const existingProduct = cart.products.find(product => product.product === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    guardarCarritos(carts);
  }
}

function guardarProductos(products) {
  fs.writeFileSync('productos.json', JSON.stringify(products, null, 2), 'utf8');
}

function guardarCarritos(carts) {
  fs.writeFileSync('carrito.json', JSON.stringify(carts, null, 2), 'utf8');
}

function generarIdUnico(items) {
  const ids = items.map(item => item.id);
  let newId;
  do {
    newId = generateRandomId();
  } while (ids.includes(newId));
  return newId;
}

function generateRandomId() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
