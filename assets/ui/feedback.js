const timers=new WeakMap();
export const NOTICE_DURATIONS=Object.freeze({success:2000,undo:8000,error:null});
export function showNotice(element,message,{error=false,duration=NOTICE_DURATIONS.success}={}){
 clearTimeout(timers.get(element));element.textContent=message;element.classList.add('ui-notice');
 element.setAttribute('role',error?'alert':'status');element.setAttribute('aria-live',error?'assertive':'polite');element.classList.toggle('error',error);
 if(!error&&duration>0)timers.set(element,setTimeout(()=>{element.textContent='';},duration));
}
