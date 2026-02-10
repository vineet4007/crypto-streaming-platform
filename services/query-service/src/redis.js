const Redis = require('ioredis')
const logger = require('./logger')

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
})

redis.on('connect', () => {
  logger.info('event=dependency_ready service=query-service dependency=redis')
})

redis.on('error', (err) => {
  logger.error({ err }, 'event=dependency_error service=query-service dependency=redis')
})

module.exports = redis
