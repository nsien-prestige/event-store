import express from 'express'
import * as eventStoreController from '../controllers/eventStore.controller.js'

const router = express.Router()

router.get('/stats', eventStoreController.getStats)
router.get('/:id', eventStoreController.getEventsById)
router.post('/', eventStoreController.saveEvent)

export default router
