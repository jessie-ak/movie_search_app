import {Client, Databases, ID, Query} from 'appwrite'
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async(searchTerm, movie) => {
    //1.use appwrite sdk to check if search term already exists in db
 
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID,
        [Query.equal('searchTerm', searchTerm)])
        
        //2. if it does, update the count
        if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count+1,
            })
        }
        //3. if it does not , create a new document with searchTerm and count=1
        else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count:1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }

    } catch(err){
        console.log(err);
    }
 
    const allDocs = await database.listDocuments(DATABASE_ID, COLLECTION_ID);
console.log("All documents:", allDocs.documents);
   

}

export const getTrendingMovies = async () => {
  try {
    // First get all non-empty search documents
    const allSearches = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.notEqual('searchTerm', '')]
    );

    // Group by movie_id and sum counts
    const movieMap = new Map();
    allSearches.documents.forEach(doc => {
      if (!movieMap.has(doc.movie_id)) {
        movieMap.set(doc.movie_id, {
          ...doc,
          totalCount: doc.count,
          variations: 1
        });
      } else {
        const existing = movieMap.get(doc.movie_id);
        // Keep the highest-count variation
        if (doc.count > existing.count) {
          Object.assign(existing, doc);
        }
        existing.totalCount += doc.count;
        existing.variations += 1;
      }
    });

    // Convert to array and sort by totalCount
    const trending = Array.from(movieMap.values())
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 5); // Top 5

    return trending;
  } catch(err) {
    console.log(err);
    return [];
  }
}
