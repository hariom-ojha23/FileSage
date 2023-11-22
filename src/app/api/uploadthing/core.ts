import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getPineconeClientIndex } from "@/lib/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !user.id) {
        console.log('HERE IT IS UNAUTHORIZED')
        console.log('user', user)
        throw new Error("Unauthorized");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isFileExist = await db.file.findFirst({
        where: { key: file.key }
      })
      if (isFileExist) return

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );
        const blob = await response.blob();

        // loading pdf document in memory
        const loader = new PDFLoader(blob);

        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        // checking length of uploaded pdf files
        const pagesPerPDF = 25
        let isLengthExceeded = pagesAmt > pagesPerPDF

        if (isLengthExceeded) {
          await db.file.update({
            data: {
              uploadStatus: 'FAILED'
            },
            where: { id: createdFile.id }
          })
        }


        // vectorize and index entire document
        const pineconeIndex = await getPineconeClientIndex()

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY!,
        });
        
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          // namespace: createdFile.id,
        });

        await db.file.update({
          data: { uploadStatus: "SUCCESS" },
          where: { id: createdFile.id },
        });
      } catch (error) {
        await db.file.update({
          data: { uploadStatus: "FAILED" },
          where: { id: createdFile.id },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
