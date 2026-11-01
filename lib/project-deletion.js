import {doc,writeBatch} from 'firebase/firestore';
// Both records disappear together. Media is retained because its download URLs may be shared.
export async function deleteProjectDocuments(db,id,firestore={doc,writeBatch}){
 if(typeof id!=='string'||!id||id.includes('/'))throw Error('Invalid project ID.');
 const batch=firestore.writeBatch(db);
 for(const collection of ['projects','publicProjects'])batch.delete(firestore.doc(db,collection,id));
 await batch.commit();
}
