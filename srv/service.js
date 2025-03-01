const cds = require('@sap/cds')

module.exports = class EmbeddingStorageService extends cds.ApplicationService { init() {

  this.before (['CREATE', 'UPDATE'], 'Notes', async (req) => {
    const db = await cds.connect.to('db')
    const { Dummy } = db.entities

    // get embedding
    const { embedding } = await SELECT .one .from(Dummy) .where({ id: 1 })
                              .columns `vector_embedding(${req.data.note}, 'DOCUMENT', 'SAP_NEB.20240715') as embedding`
    console.log('embedding', embedding)
    req.data.embedding = JSON.stringify(embedding)
  })

  this.on ('getRagResponse', async (req) => {
    const searchWord = req.data.searchWord
    const db = await cds.connect.to('db')
    const { Dummy, Notes } = db.entities
    
    // get embedding
    const { embedding } = await SELECT .one .from(Dummy) .where({ id: 1 })
                              .columns `vector_embedding(${searchWord}, 'DOCUMENT', 'SAP_NEB.20240715') as embedding`

    // retrieve relevant notes
    const notes = await SELECT.from(Notes)
                              .columns('ID', 'note')
                              .limit(3)
                              .where`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) > 0.7`
  
    return notes                    
   })

  return super.init()
}}
