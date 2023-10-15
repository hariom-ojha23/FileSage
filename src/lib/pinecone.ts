import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClientIndex = async () => {
  const pinecone = new Pinecone({      
    environment: "gcp-starter",      
    apiKey: process.env.PINECONE_API_KEY!,      
  });      

  const index = pinecone.Index("filesage");
  return index
}


   
