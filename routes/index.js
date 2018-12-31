const express = require('express');
const AuthController = require('../controllers/auth')

const router = express.Router();

/**
 * Auth Routes
 */
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/send-token', AuthController.sendToken);
router.patch('/auth/reset-pass', AuthController.resetPass);

// /**
//  * User Routes
//  */
// router.get('/users/saved-items', SavedItemController.getUserSavedItem);
// router.post('/users/saved-items', SavedItemController.addToSavedItem);
// router.patch('/users/saved-items/:item_id', SavedItemController.updateSavedItem);
// router.delete('/users/saved-items/:item_id', SavedItemController.removeSavedItem);

// router.get('/users/cart', CartController.getUserCart);
// router.post('/users/cart', CartController.addToCart);
// router.patch('/users/cart/:item_id', CartController.updateCartItem);
// router.delete('/users/cart/:item_id', CartController.removeCartItem);

// router.get('/users/orders', OrderController.getUserOders);
// router.patch('/users/orders/:order_id', OrderController.updateOrderStatus);
// router.post('/users/orders', OrderController.postUserOders);

// router.post('/users/bvn', IBSBridge.IBSBridge);

// router.get('/users/', AuthController.all);
// router.get('/users/token', AuthController.token);
// router.get('/users/:id/', AuthController.one);
// router.patch('/users/', AuthController.update);

module.exports = router;
