function amenityWithUnit(value,unit,fallback){
 const text=String(value??'').trim();
 if(!text)return fallback;
 return /^\d+(?:\.\d+)?$/.test(text)?`${text} ${unit==='mins'&&Number(text)===1?'min':unit}`:text;
}
function escapeAmenity(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderNearbyAmenities(items){
 const groups=new Map();
 for(const item of Array.isArray(items)?items:[]){if(!item||!item.name||!item.category)continue;const label=String(item.category).trim();const key=label.toLocaleLowerCase();if(!groups.has(key))groups.set(key,{label,rows:[]});groups.get(key).rows.push(item)}
 if(!groups.size)return '<p>Nearby amenities will be added once landmarks and distances are verified.</p>';
 return [...groups.values()].map(group=>`<div class="nearby-category"><h3>${escapeAmenity(group.label)}</h3><ul>${group.rows.map(row=>`<li><strong>${escapeAmenity(row.name)}</strong><span>${escapeAmenity(amenityWithUnit(row.distance,'km','Distance to be confirmed'))} · ${escapeAmenity(amenityWithUnit(row.travelTime,'mins','Travel time to be confirmed'))}</span></li>`).join('')}</ul></div>`).join('');
}
