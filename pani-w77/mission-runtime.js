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

function missionProtectMasterReset(){
  if(!MASTER)return;
  let b=$('#reset');
  if(!b||b.dataset.missionProtected==='1')return;
  b.dataset.missionProtected='1';
  b.onclick=()=>confirmBox('Resetar sessão?','Progresso dos seis jogadores e estado da estação serão restaurados. Relatórios permanecem arquivados e documentos exclusivos voltam a ser selados.',async()=>{
    try{
      await pfEdge({action:'reseal_credentials',pin});
      await ma('reset_session');
      await mrefresh();
      await missionMasterCodesRefresh();
      toast('Sessão resetada. Credenciais exclusivas foram seladas.');
    }catch(e){console.error(e);toast('Falha ao resetar a sessão.',true)}
  });
}

setInterval(()=>{missionEnsureNav();missionProtectMasterReset()},500);
setInterval(()=>{if(!MASTER&&me&&!document.hidden){if(view==='report')missionCrewReportsRefresh(false);if(view==='cred')missionCrewCredentialRefresh(false)}},7000);
missionEnsureNav();missionProtectMasterReset();
