// Conservative safety net for legacy records whose editorial notes explicitly say to keep them archived.
// Resolve the underlying permission issue and update those notes before publishing.
export function publicationHold(project){
 return ['title','sinkingFund','facilities'].some(key=>typeof project?.[key]==='string'&&/retain\s*archived|keep\s*archived|do\s*not\s*publish|internal\s*only/i.test(project[key]))
 ?'This project contains an explicit instruction to keep it archived. Confirm advertising permission and correct the project notes before publishing.':'';
}
export function isPublicProject(project){return project?.status==='Published'&&!publicationHold(project)}
