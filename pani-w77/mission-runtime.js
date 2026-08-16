'use strict';

const missionBaseRender=render;
render=function(force=false){
  if(view!=='cred'&&view!=='report')return missionBaseRender(force);
  if(!me)return;
  let f=fingerprint();
  if(!force&&f===fp){alertRender();return}
  capDraft();fp=f;alertRender();
  $('#view').innerHTML=view==='cred'?missionCredentialPage():missionReportPage();
  putDraft();navRender();
  if(view==='report')missionReportCount();
};

function missionEnsureNav(){
  if(MASTER)return;
  let n=$('#nav'),cred=n?.querySelector('[data-v="cred"]');
  if(!n||!cred||n.querySelector('[data-v="report"]'))return;
  cred.insertAdjacentHTML('afterend','<button class="btn" data-v="report">RELATÓRIO</button>');
  let b=n.querySelector('[data-v="report"]');
  b.onclick=()=>{view='report';render(true)};
  navRender();
}

setInterval(missionEnsureNav,500);
setInterval(()=>{if(!MASTER&&me&&!document.hidden){if(view==='report')missionCrewReportsRefresh(false);if(view==='cred')missionCrewCredentialRefresh(false)}},7000);
missionEnsureNav();
