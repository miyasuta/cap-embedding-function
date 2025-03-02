const cds = require('@sap/cds')

module.exports = class EmbeddingStorageService extends cds.ApplicationService { 
  init() {
    this.before(['CREATE', 'UPDATE'], 'Notes', async (req) => {
      const embedding = await this.getEmbedding(req.data.note)
      req.data.embedding = JSON.stringify(embedding)
    })

    this.on('addNotes', async (req) => {
      const { Notes } = this.entities

      // set embedding
      await Promise.all(
        req.data.notes.map(async (note) => {
          const embedding = await this.getEmbedding(note.note)
          note.embedding = JSON.stringify(embedding)
        })
      )
     
      // add notes
      await INSERT.into(Notes).entries(req.data.notes)

      // return success message
      return 'Notes added successfully'
    })

    this.on('deleteNotes', async (req) => {
      const { Notes } = this.entities
      // delete notes
      await DELETE.from(Notes)

      return 'Notes deleted successfully'
    })

    this.on('similaritySearch', async (req) => {
      const searchWord = req.data.searchWord
      const embedding = await this.getEmbedding(searchWord)    
      const embeddingString = JSON.stringify(embedding);
      
      const db = await cds.connect.to('db')
      const { Notes } = db.entities

      // retrieve relevant notes
      const notes = await SELECT.from(Notes)
                                .columns
                                         `ID,
                                         note,
                                         cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) as cosine_similarity`
                                        
                                .limit(3)
                                // .where`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) > 0.7`
                                .orderBy`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) desc`
    
      return notes                    
    })

    return super.init()
  }

  async getEmbedding(text) {
    const db = await cds.connect.to('db')
    const { Dummy } = db.entities

    // get embedding
    const { embedding } = await SELECT.one.from(Dummy).where({ id: 1 })
                              .columns `vector_embedding(${text}, 'DOCUMENT', 'SAP_NEB.20240715') as embedding`
    return embedding
  }
}
