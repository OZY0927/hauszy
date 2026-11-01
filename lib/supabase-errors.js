// Translate known Storage failures without exposing raw upstream messages, URLs or credentials.
export function storageFailureMessage(error,bucket,phase='authorize'){
 const codes=[error?.code,error?.error,error?.statusCode].filter(value=>typeof value==='string');
 const message=typeof error?.message==='string'?error.message:'';
 const status=Number(error?.status||error?.statusCode);
 if(codes.includes('NoSuchBucket')||/bucket\s*(?:not\s*found|does\s*not\s*exist)/i.test(message))return `Supabase bucket "${bucket}" was not found or is inaccessible. Set SUPABASE_STORAGE_BUCKET to the exact bucket name in your Supabase project, then redeploy.`;
 if(codes.includes('InvalidJWT')||status===401||/invalid\s*(?:api\s*key|jwt)|jwt\s*(?:expired|malformed)/i.test(message))return 'Supabase rejected the storage credentials. Check that SUPABASE_SECRET_KEY is a server secret key from the same project as NEXT_PUBLIC_SUPABASE_URL, then redeploy.';
 if(codes.includes('AccessDenied')||status===403||/row.level.security|permission denied/i.test(message))return 'Supabase denied storage access. Check SUPABASE_SECRET_KEY on your host: use the server secret key, not the publishable or anon key. Do not enable public uploads.';
 if(codes.includes('EntityTooLarge')||status===413)return 'The image exceeds your Supabase bucket’s file-size limit. Use an image under 5 MB and check the bucket restrictions.';
 if(codes.includes('InvalidMimeType')||/mime.*(?:not|invalid|unsupported)/i.test(message))return 'The Supabase bucket does not accept this image type. Allow image/jpeg, image/png and image/webp in the bucket settings.';
 if(error?.name==='TimeoutError'||error?.name==='AbortError'||/fetch failed|failed to fetch|timed?\s*out/i.test(message))return 'Supabase could not be reached. Check that the project is active and try again.';
 return phase==='authorize'?`Supabase could not authorize the upload to bucket "${bucket}". Check that this bucket exists in the configured project and that the server secret key is correct.`:'Image upload failed. Check your Supabase bucket settings and try again.';
}
export function assertStorageSecretKey(key){
 if(typeof key==='string'&&key.startsWith('sb_publishable_'))throw Error('SUPABASE_SECRET_KEY contains a publishable key. Replace it with the server secret key from Supabase Settings → API Keys, then redeploy.');
}
