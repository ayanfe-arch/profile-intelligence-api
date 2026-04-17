const express = require('express');
const router = express.Router()
const { createProfile, getAllProfiles, getSingleProfile, deleteProfile } = require('../controllers/profileController')

router.post('/', createProfile);
router.get('/', getAllProfiles);
router.get('/:id', getSingleProfile);
router.delete('/:id', deleteProfile);

module.exports = router;