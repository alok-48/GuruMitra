const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getPosts, createPost, likePost, getGroups, joinGroup, getEvents } = require('../controllers/communityController');

const router = Router();

router.get('/posts', authenticate, getPosts);
router.post('/posts', authenticate, createPost);
router.post('/posts/:id/like', authenticate, likePost);
router.get('/groups', authenticate, getGroups);
router.post('/groups/:id/join', authenticate, joinGroup);
router.get('/events', authenticate, getEvents);

module.exports = router;
