const fs = require('fs')
const path = require('path')
const {
  NOTION_TOKEN,
  BLOG_INDEX_ID,
} = require('./src/lib/notion/server-constants')

try {
  fs.unlinkSync(path.resolve('.blog_index_data'))
} catch (_) {
  /* non fatal */
}
try {
  fs.unlinkSync(path.resolve('.blog_index_data_previews'))
} catch (_) {
  /* non fatal */
}

const warnOrError =
  process.env.NODE_ENV !== 'production'
    ? console.warn
    : msg => {
        throw new Error(msg)
      }

if (!NOTION_TOKEN) {
  // We aren't able to build or serve images from Notion without the
  // NOTION_TOKEN being populated
  warnOrError(
    `\nNOTION_TOKEN is missing from env, this will result in an error\n` +
      `Make sure to provide one before starting Next.js`
  )
}

if (!BLOG_INDEX_ID) {
  // We aren't able to build or serve images from Notion without the
  // NOTION_TOKEN being populated
  warnOrError(
    `\nBLOG_INDEX_ID is missing from env, this will result in an error\n` +
      `Make sure to provide one before starting Next.js`
  )
}

module.exports = {
  env: {
    NOTION_TOKEN: "30da491ff2c5159287fb1d739786c03f514ecdd11fee293dd57faeb6e4756667d945a2cca86016d1f9bacd9be38461f45bd965b286d0f46436a7483ed54b3a874e7bb2b029e87456c739c5fed786",
    BLOG_INDEX_ID: "66b1fdc5645043afbbb0666a31d9a452"
  },
  target: 'experimental-serverless-trace',

  webpack(cfg, { dev, isServer }) {
    // only compile build-rss in production server build
    if (dev || !isServer) return cfg

    // we're in build mode so enable shared caching for Notion data
    process.env.USE_CACHE = 'true'

    const originalEntry = cfg.entry
    cfg.entry = async () => {
      const entries = { ...(await originalEntry()) }
      entries['./scripts/build-rss.js'] = './src/lib/build-rss.ts'
      return entries
    }
    return cfg
  },
}
