import * as eventStoreService from '../services/eventStore.services.js'

export const saveEvent = (req, res) => {
    const event = req.body
    const savedEvent = eventStoreService.saveEvent(event)

    if (!savedEvent) {
        return res.status(400).json({ message: 'Event body cannot be empty' });
    }
    
    res.status(201).json(savedEvent)
}

export const getEventsById = (req, res) => {
    const { id } = req.params;
    const event = eventStoreService.getEventsById(id);

    if(!event) {
        return res.status(404).json({ message: 'Event not found' })
    }
    res.status(200).json(event)
}

export const getStats = (req, res) => {
    const stats = eventStoreService.getStats()
    res.status(200).json(stats)
}