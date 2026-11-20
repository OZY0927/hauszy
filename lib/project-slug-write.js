import {doc,runTransaction,writeBatch} from 'firebase/firestore';
import {isAvailableProjectSlug,isProjectSlug,legacyProjectSlug,projectSlugCandidate} from './project-links.js';

export async function commitProjectWithSlug(db,project,write){
 if(project.status!=='Published'||legacyProjectSlug(project.id)||(isProjectSlug(project.publicSlug)&&isAvailableProjectSlug(project.publicSlug))){
  const batch=writeBatch(db);
  write(batch,null);
  await batch.commit();
  return null;
 }
 // Reserve the slug and publish the project in a single commit. Reservations
 // survive archiving and deletion, so an old address can't point to a different project.
 return runTransaction(db,async transaction=>{
  const current=(await transaction.get(doc(db,'projects',project.id))).data();
  if(isProjectSlug(current?.publicSlug)&&isAvailableProjectSlug(current.publicSlug)){
   write(transaction,current.publicSlug);
   return current.publicSlug;
  }
  for(let number=1;;number++){
   const slug=projectSlugCandidate(project,number);
   if(!isAvailableProjectSlug(slug))continue;
   const ref=doc(db,'projectSlugs',slug),owner=(await transaction.get(ref)).data();
   if(owner&&owner.projectId!==project.id)continue;
   if(!owner)transaction.set(ref,{projectId:project.id});
   write(transaction,slug);
   return slug;
  }
 });
}
