// Review-only rendering mode; never changes stored preferences.
if(new URLSearchParams(location.search).get('ui-review')==='grayscale')document.documentElement.classList.add('ui-review-grayscale');
if(new URLSearchParams(location.search).has('ui-family')||new URLSearchParams(location.search).has('ui-review')){
 addEventListener('error',event=>{
  const entry=document.createElement('pre');entry.hidden=true;entry.className='ui-review-error';
  entry.textContent=event.error?.stack||`${event.message} (${event.filename}:${event.lineno})`;
  (document.body||document.documentElement).append(entry);
 });
}
